import {StreamReader} from "./StreamReader";
import {ReadLineResponse} from "./data/ReadLineResponse";
import {Constants} from "./Constants";
import {StringTools} from "./tools/StringTools";
import {DartFormatError} from "./data/DartFormatException";
import {ProcessTools} from "./tools/ProcessTools";
import {NotificationTools} from "./tools/NotificationTools";
import {logDebug, logError} from "./tools/LogTools";
import {Tools} from "./tools/Tools";
import {Process} from "./Process";

export class TimedReader
{
    private static readonly CLASS_NAME = "TimedReader";

    static async readLine(process: Process, stdOutReader: StreamReader, stdErrReader: StreamReader, timeoutInSeconds: number, waitForName: String): Promise<ReadLineResponse | undefined>
    {
        const METHOD_NAME = TimedReader.CLASS_NAME + ".readLine";
        logDebug(METHOD_NAME + "()");

        let waitedMillis = 0;
        while (timeoutInSeconds < 0 || waitedMillis < timeoutInSeconds * 1000)
        {
            const textFromStdOut = TimedReader.receiveLine(stdOutReader, "stdout");
            if (textFromStdOut)
            {
                return new ReadLineResponse(textFromStdOut, undefined);
            }

            const textFromStdErr = TimedReader.receiveLine(stdErrReader, "stderr");
            if (textFromStdErr)
            {
                return new ReadLineResponse(undefined, textFromStdErr);
            }

            if (await ProcessTools.waitFor(process, Constants.WAIT_INTERVAL_IN_MILLIS))
            {
                const title = `Unexpected process exit while waiting for ${waitForName}.`;

                let content = "";
                content += TimedReader.receiveLines(stdOutReader, "stdout", "\nStdOut: ") ?? "";
                content += TimedReader.receiveLines(stdErrReader, "stderr", "\nStdErr: ") ?? "";
                content = content.trim();

                if (content)
                {
                    content += "\n";
                }

                content += "Did you install the dart_format package?\n" +
                    "Basically just execute this:<pre>dart pub global activate dart_format</pre>";

                const actions = [NotificationTools.createCheckInstallationInstructionsLink()];
                // TODO: add report link?
                NotificationTools.notifyError(title, content, actions);

                return undefined;
            }

            await Tools.sleep(Constants.WAIT_INTERVAL_IN_MILLIS);
            waitedMillis += Constants.WAIT_INTERVAL_IN_MILLIS;
        }

        logDebug(`${METHOD_NAME}: waitedMillis: ${waitedMillis}`);

        const errorText = "Timeout while waiting for response.";
        logError(`${METHOD_NAME}: ${errorText}`);
        throw DartFormatError.localError(errorText);
    }

    private static receiveLine(streamReader: StreamReader, name: string): string | undefined
    {
        const availableBytes = streamReader.available();
        if (availableBytes <= 0)
            return undefined;

        logDebug(`TimedReader.receiveLine(${name})`);
        logDebug(`  Receiving: ${availableBytes} bytes.`);
        const s = streamReader.readLine();
        logDebug(`  Received: ${StringTools.toDisplayString(s)}.`);
        return s;
    }

    private static receiveLines(streamReader: StreamReader, name: string, prefix: String): string | undefined
    {
        let r = "";

        while (true)
        {
            const s = TimedReader.receiveLine(streamReader, name);
            if (!s)
            {
                break;
            }

            logDebug(`TimedReader.receiveLines: Received: ${StringTools.toDisplayString(s)}.`);
            r += prefix + s;
        }

        return r;
    }
}
