import { type Result } from "../ErrorHandling/index.ts";
import {
    type Request,
    type Response,
    type ErrorResponse,
} from "../InputOutput/index.ts";

export type ResponseResult = Result<Response, ErrorResponse>;
export type AsyncResponseResult = ResponseResult | Promise<ResponseResult>;

export type Handler = (req: Request) => AsyncResponseResult;