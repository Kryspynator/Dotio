import { type AsyncResponseResult, type Handler } from "../Server/index.ts";
import { type Request } from "../InputOutput/index.ts";

export type MiddlewareHandler = (
    req: Request,
    next: Handler
) => AsyncResponseResult;

export type Middleware = {
    paths: string | string[] | RegExp;
    handler: MiddlewareHandler;
};
