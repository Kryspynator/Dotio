import { createServer } from "node:http";
import { URL } from "node:url";
import { type Result } from "./result.ts";
import {
    type Request,
    type Response,
    type ErrorResponse,
    type Method,
    responseCodes,
} from "./response.ts";

export * from "./response.ts";
export * from "./result.ts";

// Default middlewares
export const json: MiddlewareHandler = async (req, next) => {
    return {
        headers: { "content-type": "application/json" },
        ...(await next(req)),
    };
};

export type ResponseResult = Result<Response, ErrorResponse>;
export type AsyncResponseResult = ResponseResult | Promise<ResponseResult>;

export type Handler = (req: Request) => AsyncResponseResult;

export type MiddlewareHandler = (
    req: Request,
    next: Handler
) => AsyncResponseResult;

class Server {
    private readonly routes: Record<string, Record<Method, Handler>> = {};
    private readonly middlewares: {
        paths: string | string[] | RegExp;
        handler: MiddlewareHandler;
    }[] = [];

    /**
     * Adds a route to the server.
     * @param method - The HTTP method for the route (GET, POST, etc.).
     * @param path - The URL path for the route.
     * @param handler - The handler function for the route. It should return a Result object.
     */
    add(method: Method, path: string, handler: Handler) {
        this.routes[path] =
            this.routes[path] || ({} as Record<Method, Handler>);
        this.routes[path][method] = handler;
    }

    /**
     * Adds a middleware to the server.
     * @param handler - The middleware handler function.
     * @param paths - The paths to which the middleware should be applied. It can be a string, an array of strings, or a regular expression.
     */
    use(handler: MiddlewareHandler, paths: string | RegExp | string[] = /.*/) {
        this.middlewares.push({ paths, handler });
    }

    listen(port?: number, handler?: () => void) {
        createServer(async (req, res) => {
            try {
                const { method, headers: reqHeaders, url } = req;
                const urlObject = new URL(
                    url ?? "",
                    `http://${req.headers.host}`
                );
                const { searchParams, pathname } = urlObject;
                const route = this.routes[pathname];

                if (!route) {
                    res.writeHead(responseCodes.notFound, {
                        "Content-Type": "application/json",
                    });
                    res.end(JSON.stringify({ error: "Not Found" }));
                    return;
                }

                const handler = route[method as Method];

                if (!handler) {
                    res.writeHead(responseCodes.methodNotAllowed, {
                        "Content-Type": "application/json",
                    });
                    res.end(JSON.stringify({ error: "Method Not Allowed" }));
                    return;
                }

                const middlewares = this.middlewares.filter((middleware) => {
                    if (typeof middleware.paths === "string") {
                        return middleware.paths === pathname;
                    } else if (middleware.paths instanceof RegExp) {
                        return middleware.paths.test(pathname);
                    } else if (Array.isArray(middleware.paths)) {
                        return middleware.paths.some(
                            (path) => path === pathname
                        );
                    }
                    return false;
                });

                const request: Request = {
                    method: method as Method,
                    pathname: pathname as string,
                    headers: reqHeaders,
                    body: null,
                    params: searchParams,
                };

                const response = await (middlewares.length === 0
                    ? handler(request)
                    : middlewares[0].handler(request, () => {
                          const executeMiddlewares = (index: number) => {
                              if (index >= middlewares.length) {
                                  return handler(request);
                              }
                              const middleware = middlewares[index];
                              return Promise.resolve(
                                  middleware.handler(request, () =>
                                      executeMiddlewares(index + 1)
                                  )
                              );
                          };

                          return executeMiddlewares(1);
                      }));

                const { error, data } = response;
                if (error) {
                    res.writeHead(
                        error.status ?? responseCodes.internalServerError,
                        {
                            "Content-Type": "application/json",
                        }
                    );
                    res.end(
                        JSON.stringify(error.body ?? { error: error.message })
                    );
                    return;
                }

                const { status, body, headers: resHeaders } = data || {};

                res.writeHead(
                    status ?? responseCodes.ok,
                    undefined,
                    resHeaders ?? { "Content-Type": "application/json" }
                );
                res.end(JSON.stringify(body));
            } catch (error) {
                res.writeHead(responseCodes.internalServerError, {
                    "Content-Type": "application/json",
                });
                res.end(JSON.stringify({ error: error.message }));
            }
        }).listen(port, handler);
    }
}

export const create = () => {
    return new Server();
};
