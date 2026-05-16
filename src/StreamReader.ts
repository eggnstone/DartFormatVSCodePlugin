import {Readable} from "node:stream";
import {StringDecoder} from "node:string_decoder";
import {logDebug} from "./tools/LogTools";
import {StringTools} from "./tools/StringTools";
import {Constants} from "./Constants";

export class StreamReader
{
    private static readonly NEW_LINE_CODE = 10;

    private buffer: string = "";
    // Node delivers stdout/stderr as Buffer chunks; a multi-byte UTF-8 sequence
    // can straddle a chunk boundary. StringDecoder.write() holds back any
    // partial trailing sequence and prepends it to the next chunk, so we never
    // see Unicode replacement characters at chunk seams.
    private readonly decoder: StringDecoder = new StringDecoder("utf8");

    constructor(inputStream: Readable, name: string)
    {
        inputStream.on("data", (data: Buffer) =>
        {
            const decoded = this.decoder.write(data);
            if (Constants.DEBUG_TIMED_READER) logDebug(`StreamReader(${name}).onData(${StringTools.toDisplayString(decoded)})`);
            this.buffer += decoded;
        });
        inputStream.on("end", () =>
        {
            this.buffer += this.decoder.end();
        });
    }

    readLine(): string
    {
        if (Constants.DEBUG_TIMED_READER) logDebug("StreamReader.readLine()");

        let s = "";

        while (true)
        {
            const c = this.read();

            if (c === -1)
                break;

            if (c === StreamReader.NEW_LINE_CODE)
                break;

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
            return -1; // EOF

        const c = this.buffer.charCodeAt(0);
        this.buffer = this.buffer.substring(1);
        return c;
    }
}
