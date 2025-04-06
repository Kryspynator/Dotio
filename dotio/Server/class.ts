import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from "node:http";
import { type Handler } from "./index.ts";
import { type Request, type Response } from "../InputOutput/index.ts";
import {
    type MiddlewareHandler,
    type Middleware,
} from "../Middlewares/index.ts";
import { type Method, responseCodes } from "../Routes/index.ts";

export class Server {
    private readonly routes: Record<string, Record<Method, Handler>> = {};
    private readonly middlewares: Middleware[] = [];

    /**
     * Adds a route to the server.
     * @param method - The HTTP method for the route (GET, POST, etc.).
     * @param path - The URL path for the route.
     * @param handler - The handler function for the route. It should return a Result object.
     */
    add(method: Method, path: string, handler: Handler) {
        this.routes[path] =
            this.routes[path] ?? ({} as Record<Method, Handler>);
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

    private async handleNoMatchingRoute(res: ServerResponse) {
        res.writeHead(responseCodes.notFound, {
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ error: "Not Found" }));
    }

    private async handleNoMatchingMethod(res: ServerResponse) {
        res.writeHead(responseCodes.methodNotAllowed, {
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ error: "Method Not Allowed" }));
    }

    private async handleErrorResponse(res: ServerResponse, error) {
        res.writeHead(error.status ?? responseCodes.internalServerError, {
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify(error.body ?? { error: error.message }));
    }

    private async handleInternalServerError(res: ServerResponse, error) {
        res.writeHead(responseCodes.internalServerError, {
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ error: error.message }));
    }

    private async handleSuccessResponse(
        res: ServerResponse,
        data: Response | void
    ) {
        const { status, body, headers } = data ?? {};

        res.writeHead(
            status ?? responseCodes.ok,
            undefined,
            headers ?? { "Content-Type": "application/json" }
        );
        res.end(JSON.stringify(body));
    }

    private async startServer(req: IncomingMessage, res: ServerResponse) {
        try {
            const { method, headers, url } = req;

            const urlObject = new URL(url ?? "", `http://${req.headers.host}`);

            const { searchParams, pathname } = urlObject;

            const routePath = Object.keys(this.routes).find((route) =>
                matchPaths(route, pathname)
            );

            if (!routePath) return this.handleNoMatchingRoute(res);

            const routeMethods = this.routes[routePath];

            if (!routeMethods) return this.handleNoMatchingRoute(res);

            const handler = routeMethods[method as Method];

            if (!handler) return this.handleNoMatchingMethod(res);

            const routeParams = (() => {
                const routeSegments = routePath.split("/");
                const pathnameSegments = pathname.split("/");

                const routeParams = {} as Record<string, string>;

                for (let i = 0; i < routeSegments.length; i++) {
                    const routeSegment = routeSegments[i];
                    const pathnameSegment = pathnameSegments[i];

                    if (routeSegment.startsWith(":"))
                        routeParams[routeSegment.slice(1)] = pathnameSegment;
                }

                return routeParams;
            })();

            console.log("Route Params:", routeParams);

            const middlewares = this.middlewares.filter((middleware) => {
                if (typeof middleware.paths === "string") {
                    return matchPaths(middleware.paths, pathname);
                } else if (middleware.paths instanceof RegExp) {
                    return middleware.paths.test(pathname);
                } else if (Array.isArray(middleware.paths)) {
                    return middleware.paths.some((path) =>
                        matchPaths(path, pathname)
                    );
                }
                return false;
            });

            console.log("Middlewares:", middlewares);

            const request: Request = {
                method: method as Method,
                pathname: pathname,
                headers,
                body: null,
                searchParams,
                routeParams,
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
            if (error) return this.handleErrorResponse(res, error);
            this.handleSuccessResponse(res, data);
        } catch (error) {
            this.handleInternalServerError(res, error);
        }
    }

    /**
     * Starts the server and listens on the specified port.
     * @param port - The port number to listen on. If not provided, a random port will be used.
     * @param handler - A callback function that will be called when the server starts listening.
     */
    listen(port?: number, handler?: () => void) {
        createServer(this.startServer.bind(this)).listen(port, handler);
    }
}

const matchPaths = (server, client) => {
    const serverSegments = server.split("/");
    const clientSegments = client.split("/");

    if (serverSegments.length !== clientSegments.length) return false;

    for (let i = 0; i < serverSegments.length; i++) {
        const serverSegment = serverSegments[i];
        const clientSegment = clientSegments[i];

        if (serverSegment.startsWith(":")) continue;
        if (serverSegment !== clientSegment) return false;
    }

    return true;
};
