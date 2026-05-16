import {ExternalDartFormatTools} from "./ExternalDartFormatTools";
import {logDebug} from "./LogTools";
import {NotificationTools} from "./NotificationTools";
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

        // ProcessTools.spawn already handles the cross-platform plumbing:
        // Windows runs through cmd.exe; Unix runs through `$SHELL -ilc ...`
        // so the user's interactive PATH (where dart lives) is sourced.
        const executable = dartPathOrError.path;
        const args = ["pub", "global", "activate", "dart_format"];

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
