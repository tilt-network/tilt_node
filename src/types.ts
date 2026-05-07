export type Option<T> = T | null | undefined;

export class Ok<T> {
  readonly _tag = "Ok" as const;
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T> { return true; }
  isErr(): false { return false; }
  unwrap(): T { return this.value; }
}

export class Err<E> {
  readonly _tag = "Err" as const;
  constructor(public readonly value: E) {}
  isOk(): false { return false; }
  isErr(): this is Err<E> { return true; }
  unwrap(): never { throw new Error(`called unwrap() on Err: ${JSON.stringify(this.value)}`); }
}

export type Result<T, E> = Ok<T> | Err<E>;

export interface TiltError {
  message: string;
}

export enum Environment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

export function isSome<T>(value: Option<T>): value is T {
  return value !== null && value !== undefined;
}

export function unwrapOption<T>(value: Option<T>): T {
  if (!isSome(value)) throw new Error("Tried to unwrap null/undefined Option");
  return value;
}

export function unwrapOrOption<T>(value: Option<T>, defaultValue: T): T {
  return isSome(value) ? value : defaultValue;
}
