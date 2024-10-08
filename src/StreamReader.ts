import {Readable} from "node:stream";
import {logDebug} from "./tools/LogTools";
import {StringTools} from "./tools/StringTools";
import {Constants} from "./Constants";

export class StreamReader
{
    private static readonly NEW_LINE_CODE = 10;

    private buffer: string = "";

    constructor(inputStream: Readable, name: string)
    {
        inputStream.on("data", (data) =>
        {
            if (Constants.DEBUG_TIMED_READER) logDebug(`StreamReader(${name}).onData(${StringTools.toDisplayString(data)})`);
            this.buffer += data.toString();
        });
    }

    readLine(): string
    {
        if (Constants.DEBUG_TIMED_READER) logDebug("StreamReader.readLine()");

        let s = "";

        while (true)
        {
            const c = this.read();
            //if (Constants.DEBUG_TIMED_READER) logDebug("StreamReader.readLine() c: " + c);

            if (c === -1)
            {
                break;
            }

            if (c === StreamReader.NEW_LINE_CODE)
            {
                break;
            }

            s += String.fromCharCode(c);
        }

        return s;
    }

    available(): number
    {
        return this.buffer.length;
    }

    private read(): number
    {
        if (this.buffer.length === 0)
        {
            return -1; // EOF
        }

        const c = this.buffer.charCodeAt(0);
        this.buffer = this.buffer.substring(1);
        return c;
    }
}
