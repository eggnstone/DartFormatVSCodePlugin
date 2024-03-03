import {Process} from "../Process";

export class ProcessTools
{
    // Returns true when process died.
    static async waitFor(process: Process, waitInMillis: number): Promise<boolean>
    {
        if (!process.isAlive())
        {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, waitInMillis));

        return !process.isAlive();
    }
}
