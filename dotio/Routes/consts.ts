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

export const methods = {
    get: "GET",
    post: "POST",
    put: "PUT",
    patch: "PATCH",
    delete: "DELETE",
} as const;

