import {ChildProcess} from "node:child_process";

export class ProcessTools
{
    // Returns true when process died.
    static async waitFor(process: ChildProcess, waitInMillis: number)
    {
        if (!process.connected)
            return true;

        await new Promise(resolve => setTimeout(resolve, waitInMillis));

        return !process.connected;
    }
}
