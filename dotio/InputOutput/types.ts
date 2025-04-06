import {
    type IncomingHttpHeaders,
    type OutgoingHttpHeader,
    type OutgoingHttpHeaders,
} from "node:http";
import { type Method, type ResponseCode } from "../Routes/index.ts";

export type Request = {
    method: Method;
    pathname: string;
    body: unknown;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[];
    searchParams: URLSearchParams;
    routeParams: Record<string, string>;
};

export type Response = {
    status?: ResponseCode;
    body?: unknown;
    headers?: IncomingHttpHeaders;
};

export type Error = {
    message?: string;
};

export type ErrorResponse = Error & Response;
