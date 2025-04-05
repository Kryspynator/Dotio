import { badRequest, create, json, methods, ok } from "./dotio/index.ts";

const server = create();

server.use(json);

server.add(methods.get, "/hello", ({ params }) => {
    const name = params.get("name");
    if (!name) {
        return badRequest("Name is required");
    }
    return ok(`Hello, ${name}!`);
});

server.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
