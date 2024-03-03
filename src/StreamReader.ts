import {Readable} from "node:stream";

export class StreamReader
{
    private readonly inputStream: Readable;
    private buffer: string = "";

    constructor(inputStream: Readable)
    {
        this.inputStream = inputStream;
    }

    readLine(): string
    {
        let s = "";

        while (true)
        {
            const c = this.inputStream.read();

            if (c === -1)
            {
                break;
            }

            if (c === '\n') //.code)
            {
                break;
            }

            s += c; //.toChar();
        }

        return s;
    }

    available(): boolean
    {
        if (this.buffer.length > 0)
        {
            return true;
        }

        const data = this.inputStream.read();
        if (!data)
        {
            return false;
        }

        this.buffer = data.toString();
        return true;
    }
}
