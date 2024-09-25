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

    static spawn(command: string): Process
    {
        logDebug("ProcessTools.spawn()");
        /*logDebug("  envShell:      " + OsTools.instance.envShell);
        logDebug("  envShellParam: " + OsTools.instance.envShellParam);*/
        logDebug("  command:       " + command);

        const fullCommand = `${OsTools.instance.envShell} ${OsTools.instance.envShellParam} "${command}"`;
        logDebug("  fullCommand:   " + fullCommand);
        return new Process(spawn(fullCommand, {shell: true}));
    }
}
