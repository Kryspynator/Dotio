import { type MiddlewareHandler } from "./types.ts";

export const json: MiddlewareHandler = async (req, next) => {
    return {
        headers: { "content-type": "application/json" },
        ...(await next(req)),
    };
};
