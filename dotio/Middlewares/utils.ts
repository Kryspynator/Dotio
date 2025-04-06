import { badRequest } from "../InputOutput/utils.ts";
import { type MiddlewareHandler } from "./types.ts";

export const jsonInput: MiddlewareHandler = async (req, next) => {
    const contentType =
        req.headers["content-type"] || req.headers["Content-Type"];
    if (contentType === "application/json") {
        try {
            req.body = JSON.parse(req.body as string);
        } catch (error) {
            return badRequest("Invalid JSON body");
        }
    }
    return next(req);
};

export const jsonOutput: MiddlewareHandler = async (req, next) => {
    return {
        headers: { "content-type": "application/json" },
        ...(await next(req)),
    };
};
