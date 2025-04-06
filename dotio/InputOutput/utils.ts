import { type Failure, type Success } from "../ErrorHandling/index.ts";
import { type ResponseCode, responseCodes } from "../Routes/index.ts";
import { type ErrorResponse, type Response } from "./index.ts";

// Utility function to create a response object

/**
 * Utility function to create a success (positive/neutral) response object
 * @param data - The response data or string message
 * @param status - The HTTP status code
 * @return A success response object
 */
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

/**
 * Utility function to create a failure (negative) response object
 * @param error - The error object or string message
 * @param status - The HTTP status code
 * @returns A failure response object
 */
export const bad = (
    error: ErrorResponse | string,
    status: ResponseCode
): Failure<ErrorResponse> => {
    return {
        data: null,
        error: {
            status,
            ...(typeof error === "string" ? { message: error } : error),
        },
    };
};

// Utility functions to create specific response objects

// Utility functions to positive/neutral specific response objects
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

// Utility functions to negative specific response objects
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
