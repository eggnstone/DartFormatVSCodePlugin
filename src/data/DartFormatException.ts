import {FailType} from "../enums/FailType";
import {ExceptionSourceType} from "../enums/ExceptionSourceType";

export class DartFormatError extends Error
{
    private readonly type: FailType;
    private readonly source: ExceptionSourceType;
    private readonly line: number | undefined;
    private readonly column: number | undefined;

    constructor(
        type: FailType,
        source: ExceptionSourceType,
        message: string,
        cause: Error | undefined,
        line: number | undefined,
        column: number | undefined
    )
    {
        super(message);
        this.name = "DartFormatError";
        this.type = type;
        this.source = source;
        this.cause = cause;
        this.line = line;
        this.column = column;
    }

    static localError(message: string, cause?: Error | undefined, line?: number, column?: number): DartFormatError
    {
        return new DartFormatError(FailType.Error, ExceptionSourceType.Local, message, cause, line, column);
    }
}
