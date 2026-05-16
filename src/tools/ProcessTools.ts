import {spawn} from "node:child_process";
import {Process} from "../data/Process";
import {OsTools} from "./OsTools";
import {logDebug} from "./LogTools";

export class ProcessTools
{
    // Returns true when process died.
    static async waitFor(process: Process, waitInMillis: number): Promise<boolean>
    {
        if (!process.isAlive())
            return true;

        await new Promise(resolve => setTimeout(resolve, waitInMillis));

        return !process.isAlive();
    }

    static spawn(executable: string, args: string[]): Process
    {
        logDebug("ProcessTools.spawn()");
        logDebug("  executable: " + executable);
        logDebug("  args:       " + JSON.stringify(args));

        if (OsTools.instance.isWindows)
        {
            // Node can't execute .bat/.cmd directly without a shell; route
            // through cmd.exe so the path and args are passed as separate
            // argv entries instead of a concatenated command line.
            return new Process(spawn("cmd.exe", ["/c", executable, ...args]));
        }

        return new Process(spawn(executable, args));
    }
}
