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

        // Unix: route through the user's interactive login shell ($SHELL -ilc)
        // so rc files are sourced. IDE-launched processes inherit a stripped
        // PATH that typically doesn't include where the user installed Dart /
        // Flutter, so without rc sourcing `dart pub global activate` fails to
        // find `dart` and dart_format itself fails to find the Dart runtime
        // when running its snapshot.
        const shell = OsTools.instance.envShell || "/bin/sh";
        const command = [executable, ...args].map(ProcessTools._shellSingleQuote).join(" ");
        logDebug("  shell:      " + shell);
        logDebug("  command:    " + command);
        return new Process(spawn(shell, ["-ilc", command]));
    }

    // Single-quote a string for /bin/sh / bash / zsh. Embedded single quotes
    // are encoded as '\'' (close-quote, escaped-quote, re-open-quote).
    private static _shellSingleQuote(s: string): string
    {
        return "'" + s.replace(/'/g, "'\\''") + "'";
    }
}
