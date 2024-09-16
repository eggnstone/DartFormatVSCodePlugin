export class PathOrError
{
    readonly error?: Error;
    readonly path?: string;

    constructor(path?: string, error?: Error)
    {
        this.path = path;
        this.error = error;
    }

    static error(s: string)
    {
        return new PathOrError(undefined, new Error(s));
    }

    static path(path: string)
    {
        return new PathOrError(path, undefined);
    }
}
