export type Success<T> = {
    data: T | void;
    error: null;
};

export type Failure<E> = {
    data: null;
    error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export const success = <T>(data: T | void): Success<T> => {
    return { data: data, error: null };
};

export const failure = <E>(error: E): Failure<E> => {
    return { data: null, error };
};
