import {
    badRequest,
    create,
    jsonInput,
    jsonOutput,
    methods,
    ok,
} from "./dotio/index.ts";

const server = create();

server.use(jsonOutput);
server.use(jsonInput);

server.use(async (req, next) => {
    console.log("Request received:", req.method, req.pathname);
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
    return next(req);
});

server.use(async (req, next) => {
    const result = await next(req);
    if (result.error) {
        console.error("An Error Occurred:", result.error);
    }
    return result;
});

server.add(
    methods.get,
    "/hello/:firstName",
    ({ routeParams, searchParams }) => {
        const firstName = routeParams.firstName;
        const lastName = searchParams.get("lastName");
        if (!firstName) {
            return badRequest("First name is required is required");
        }
        if (!lastName) {
            return badRequest("Last name is required");
        }
        return ok({ body: { message: `Hello, ${firstName} ${lastName}!` } });
    }
);

server.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
