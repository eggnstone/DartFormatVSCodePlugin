import vscode from "vscode";
import {NotificationTools} from "../tools/NotificationTools";
import {StreamReader} from "../StreamReader";
import {ReadLineResponse} from "./ReadLineResponse";
import {TimedReader} from "../TimedReader";
import {Constants} from "../Constants";
import {ProcessTools} from "../tools/ProcessTools";

export class ActionInfo
{
    readonly name: string;
    readonly callback: () => void;

    constructor(name: string, callback: () => void)
    {
        this.name = name;
        this.callback = callback;
    }

    static createBrowserAction(name: string, url: string): ActionInfo
    {
        return new ActionInfo(name, () => vscode.env.openExternal(vscode.Uri.parse(url)));
    }

    static createExternalAction(name: string, command: string, successAction: ActionInfo): ActionInfo
    {
        return new ActionInfo(name, async () =>
        {
            NotificationTools.notifyInfo(("Starting process: " + command));
            const process = ProcessTools.spawn(command);
            if (!process.isAlive())
            {
                const title = "Failed to start process: " + command;
                NotificationTools.notifyError(title);
                return;
            }

            NotificationTools.notifyInfo("Process is alive.\nWaiting for result ...");

            const processStdOutReader = new StreamReader(process.stdOut, "stdout");
            const processStdErrReader = new StreamReader(process.stdErr, "stderr");
            let readLineResponse: ReadLineResponse | undefined;

            let stdOut = "";
            let stdErr = "";
            while (true)
            {
                readLineResponse = await TimedReader.readLine(
                    process,
                    processStdOutReader,
                    processStdErrReader,
                    Constants.WAIT_FOR_EXTERNAL_INSTALL_DART_FORMAT_START_IN_SECONDS,
                    "process to finish",
                    true
                );
                if (readLineResponse === undefined)
                    break;

                if (readLineResponse.stdErr)
                    stdErr += readLineResponse.stdErr;

                if (readLineResponse.stdOut)
                    stdOut += readLineResponse.stdOut;
            }

            if (stdErr)
                NotificationTools.notifyError("Process has exited with error:", "\"" + stdErr + "\"");
            else if (stdOut)
                NotificationTools.notifyInfo("Process has exited.", "Output: \"" + stdOut + "\"", [successAction]);
            else
                NotificationTools.notifyError("Process has exited with unknown error. ExitCode: " + process.exitCode());
        });
    }
}
