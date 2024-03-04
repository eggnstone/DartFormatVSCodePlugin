import {FailType} from "../enums/FailType";
import {ExceptionSourceType} from "../enums/ExceptionSourceType";
import {JsonTools} from "../tools/JsonTools";

export class DartFormatError extends Error
{
    readonly type: FailType;
    readonly source: ExceptionSourceType;
    readonly line: number | undefined;
    readonly column: number | undefined;

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

    static fromJson(json: string): DartFormatError
    {
        return new DartFormatError(
            JsonTools.getOrUndefined(json, "Type") === "Warning" ? FailType.Warning : FailType.Error,
            ExceptionSourceType.Remote,
            JsonTools.getOrUndefined(json, "Message") ?? "",
            undefined,
            JsonTools.getOrUndefined(json, "Line"),
            JsonTools.getOrUndefined(json, "Column")
        );
    }
}
