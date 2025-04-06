import { type Failure, type Success } from "./types.ts";

export const success = <T>(data: T | void): Success<T> => {
    return { data: data, error: null };
};

export const failure = <E>(error: E): Failure<E> => {
    return { data: null, error };
};
