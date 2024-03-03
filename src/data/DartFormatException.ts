export class DartFormatError extends Error
{
    constructor(message: string)
    {
        super(message);
        this.name = "DartFormatError";
    }
}
