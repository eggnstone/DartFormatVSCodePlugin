// Discriminated union: each result has either `path` (success) or `error`
// (failure), never both. Using `error?: undefined` on the success variant
// lets TypeScript narrow `path` to `string` after an `if (info.error)`
// early-return — no `!` non-null assertion needed at call sites.
export type PathOrError =
    | { readonly path: string; readonly error?: undefined }
    | { readonly path?: undefined; readonly error: Error };

export const PathOrError = {
    path(path: string): PathOrError
    {
        return {path};
    },

    error(message: string): PathOrError
    {
        return {error: new Error(message)};
    }
};
