import { methods, responseCodes } from "./consts.ts";

export type ResponseCode = (typeof responseCodes)[keyof typeof responseCodes];
export type Method = (typeof methods)[keyof typeof methods];
