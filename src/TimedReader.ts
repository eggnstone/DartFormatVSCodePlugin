import * as Process from "process";
import {StreamReader} from "./StreamReader";
import {ChildProcess} from "node:child_process";
import {ReadLineResponse} from "./data/ReadLineResponse";
import {logDebug, logError, Tools} from "./tools/Tools";
import {Constants} from "./Constants";
import {StringTools} from "./tools/StringTools";
import {DartFormatError} from "./data/DartFormatException";

export class TimedReader
{
    private static readonly CLASS_NAME = "TimedReader";

    static readLine(process: ChildProcess, inputStreamReader: StreamReader, errorStreamReader: StreamReader, timeoutInSeconds: number, waitForName: String): ReadLineResponse | undefined
    {
        const METHOD_NAME = TimedReader.CLASS_NAME + ".readLine";
        logDebug(METHOD_NAME + "()");

        let waitedMillis = 0;
        while (timeoutInSeconds < 0 || waitedMillis < timeoutInSeconds * 1000)
        {
            const textFromInputStream = TimedReader.receiveLine(inputStreamReader)
            if (textFromInputStream)
            {
                return new ReadLineResponse(textFromInputStream, undefined);
            }

            const textFromErrorStream = TimedReader.receiveLine(errorStreamReader)
            if (textFromErrorStream)
            {
                return new ReadLineResponse(undefined, textFromErrorStream);
            }

            if (process.waitFor(Constants.WAIT_INTERVAL_IN_MILLIS.toLong(), java.util.concurrent.TimeUnit.MILLISECONDS))
            {
                const title = "Unexpected process exit while waiting for $waitForName.";

                let content = "";
                content += TimedReader.receiveLines(inputStreamReader, "\nStdOut: ") ? : "";
                content += TimedReader.receiveLines(errorStreamReader, "\nStdErr: ") ? : "";
                content = content.trim()

                if (content.isNotEmpty())
                {
                    content += "\n"
                }

                content += "Did you install the dart_format package?\n" +
                    "Basically just execute this:<pre>dart pub global activate dart_format</pre>"

                const checkInstallationInstructionsLink = NotificationTools.createCheckInstallationInstructionsLink()
                const reportErrorLink = NotificationTools.createReportErrorLink(
                    content = content.ifEmpty
                {
                    null
                }
            ,
                gitHubRepo = Constants.REPO_NAME_DART_FORMAT_JET_BRAINS_PLUGIN,
                    origin = null,
                    stackTrace = null,
                    title = title
            )

                NotificationTools.notifyError(NotificationInfo(
                    content = content.ifEmpty
                {
                    null
                }
            ,
                links = listOf(checkInstallationInstructionsLink, reportErrorLink),
                    origin = null,
                    project = null,
                    title = title,
                    virtualFile = null
            ))

                return null;
            }

            await Tools.sleep(Constants.WAIT_INTERVAL_IN_MILLIS);
            waitedMillis += Constants.WAIT_INTERVAL_IN_MILLIS;
        }

        logDebug(METHOD_NAME + ": waitedMillis: $waitedMillis")

        const errorText = "Timeout while waiting for response.";
        logError(METHOD_NAME + ": $errorText");
        throw DartFormatError.localError(errorText);
    }

    private static receiveLine(streamReader: StreamReader): string | undefined
    {
        if (!streamReader.available())
        {
            return undefined;
        }

        logDebug("TimedReader.receiveLine: Receiving: $availableBytes bytes.")
        const s = streamReader.readLine();
        logDebug("TimedReader.receiveLine: Received: ${StringTools.toDisplayString(s, 100)}.");
        return s;
    }

    private static receiveLines(streamReader: StreamReader, prefix: String): string | undefined
    {
        let r = "";

        while (true)
        {
            const s = TimedReader.receiveLine(streamReader);
            if (!s)
            {
                break;
            }

            logDebug("TimedReader.receiveLines: Received: " + StringTools.toDisplayString(s, 100) + ".")
            r += prefix + s;
        }

        return r;
    }
}
