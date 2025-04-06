import { badRequest, create, methods, ok } from "./dotio/index.ts";

const server = create();

server.use((req, next) => {
    console.log("Request received:", req.method, req.pathname);
    return next(req);
});

server.use(async (req, next) => {
    const result = await next(req);
    if (result.error) {
        console.error("Error:", result.error);
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
        return ok(`Hello, ${firstName} ${lastName}!`);
    }
);

server.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
