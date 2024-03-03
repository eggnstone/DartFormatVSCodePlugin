export class ReadLineResponse
{
    readonly stdOut: string | undefined;
    readonly stdErr: string | undefined;

    constructor(stdOut: string | undefined, stdErr: string | undefined)
    {
        this.stdOut = stdOut;
        this.stdErr = stdErr;
    }
}
