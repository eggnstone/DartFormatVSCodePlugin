import {ExternalDartFormatTools} from "./ExternalDartFormatTools";
import {logDebug} from "./LogTools";
import {NotificationTools} from "./NotificationTools";
import {OsTools} from "./OsTools";
import {ProcessTools} from "./ProcessTools";

export class DartFormatInstaller
{
    // Runs `dart pub global activate dart_format` and waits for it to finish.
    // Shows "Installing"/"Updating" + outcome notifications. Returns true on
    // exit code 0.
    static async tryInstall(isUpdate: boolean): Promise<boolean>
    {
        const dartPathOrError = ExternalDartFormatTools.getDartPathOrError();
        if (dartPathOrError.error)
        {
            const verb = isUpdate ? "update" : "install";
            NotificationTools.notifyError(
                `DartFormat: Cannot ${verb} dart_format.`,
                dartPathOrError.error.message
            );
            return false;
        }

        const verbIng = isUpdate ? "Updating" : "Installing";
        const verbLow = isUpdate ? "update" : "install";
        const verbEd = isUpdate ? "Updated" : "Installed";

        const dartPath = dartPathOrError.path!;
        const activateArgs = ["pub", "global", "activate", "dart_format"];

        // Mirrors the path-resolution in NotificationTools.createInstallAction:
        // on Unix without ~/.pub-cache/bin in PATH we go through /bin/sh -c so
        // the binary lands somewhere reachable for the rest of the session.
        let executable: string;
        let args: string[];
        if (OsTools.instance.isWindows)
        {
            executable = dartPath;
            args = activateArgs;
        }
        else
        {
            const envPath = process.env["PATH"] ?? "";
            const pubCacheBinPath = OsTools.instance.envHome + "/.pub-cache/bin";
            if (envPath.indexOf(pubCacheBinPath) >= 0)
            {
                executable = dartPath;
                args = activateArgs;
            }
            else
            {
                const shellCommand = `export PATH="$PATH:${pubCacheBinPath}" && ${dartPath} ${activateArgs.join(" ")}`;
                executable = "/bin/sh";
                args = ["-c", shellCommand];
            }
        }

        NotificationTools.notifyInfo(`${verbIng} dart_format ...`, "This may take a few seconds.");
        logDebug(`DartFormatInstaller.tryInstall: ${executable} ${args.join(" ")}`);

        const proc = ProcessTools.spawn(executable, args);
        if (!proc.isAlive())
        {
            NotificationTools.notifyError(`DartFormat: Failed to ${verbLow} dart_format.`, "Could not start the installer process.");
            return false;
        }

        const exitCode = await proc.waitForExit();
        logDebug(`DartFormatInstaller.tryInstall: exit code ${exitCode}`);

        if (exitCode !== 0)
        {
            NotificationTools.notifyError(
                `DartFormat: Failed to ${verbLow} dart_format.`,
                `Installer exited with code ${exitCode}.`
            );
            return false;
        }

        NotificationTools.notifyInfo(`DartFormat: ${verbEd} dart_format successfully.`);
        return true;
    }
}
