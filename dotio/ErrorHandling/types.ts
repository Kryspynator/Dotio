export type Success<T> = {
    data: T | void;
    error: null;
};

export type Failure<E> = {
    data: null;
    error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;
