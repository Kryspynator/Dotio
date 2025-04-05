import {
    OutgoingHttpHeader,
    OutgoingHttpHeaders,
    type IncomingHttpHeaders,
} from "node:http";
import { Failure, Success } from "./result.ts";

export const responseCodes = {
    ok: 200,
    created: 201,
    accepted: 202,
    noContent: 204,
    movedPermanently: 301,
    found: 302,
    notModified: 304,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    methodNotAllowed: 405,
    internalServerError: 500,
    notImplemented: 501,
    badGateway: 502,
    serviceUnavailable: 503,
    gatewayTimeout: 504,
} as const;

export type ResponseCode = (typeof responseCodes)[keyof typeof responseCodes];

export type Response = {
    status?: ResponseCode;
    body?: unknown;
    headers?: IncomingHttpHeaders;
};

export type ErrorResponse = Error & Response;

export const methods = {
    get: "GET",
    post: "POST",
    put: "PUT",
    patch: "PATCH",
    delete: "DELETE",
} as const;

export type Method = (typeof methods)[keyof typeof methods];

export type Request = {
    method: Method;
    pathname: string;
    body: unknown;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[];
    params: URLSearchParams;
};

export const good = (
    data: Response | string,
    status: ResponseCode
): Success<Response> => {
    if (typeof data === "string") {
        return {
            data: { status, body: data, headers: {} },
            error: null,
        };
    }
    return {
        data: { ...data, status: responseCodes.ok },
        error: null,
    };
};

export const bad = (
    error: ErrorResponse | string,
    status: ResponseCode
): Failure<ErrorResponse> => {
    if (typeof error === "string") {
        return {
            data: null,
            error: { status, ...new Error(error) },
        };
    }
    return {
        data: null,
        error: { status: responseCodes.ok, ...error },
    };
};

export const ok = (data: Response | string): Success<Response> => {
    return good(data, responseCodes.ok);
};
export const created = (data: Response | string): Success<Response> => {
    return good(data, responseCodes.created);
};
export const accepted = (data: Response | string): Success<Response> => {
    return good(data, responseCodes.accepted);
};
export const noContent = (data: Response | string): Success<Response> => {
    return good(data, responseCodes.noContent);
};
export const movedPermanently = (
    data: Response | string
): Success<Response> => {
    return good(data, responseCodes.movedPermanently);
};
export const found = (data: Response | string): Success<Response> => {
    return good(data, responseCodes.found);
};
export const notModified = (data: Response | string): Success<Response> => {
    return good(data, responseCodes.notModified);
};

export const badRequest = (
    error: ErrorResponse | string
): Failure<ErrorResponse> => {
    return bad(error, responseCodes.badRequest);
};
export const unauthorized = (
    error: ErrorResponse | string
): Failure<ErrorResponse> => {
    return bad(error, responseCodes.unauthorized);
};
export const forbidden = (
    error: ErrorResponse | string
): Failure<ErrorResponse> => {
    return bad(error, responseCodes.forbidden);
};
export const notFound = (
    error: ErrorResponse | string
): Failure<ErrorResponse> => {
    return bad(error, responseCodes.notFound);
};
