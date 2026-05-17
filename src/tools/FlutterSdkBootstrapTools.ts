import {NotificationTools} from "./NotificationTools";

export class FlutterSdkBootstrapTools
{
    // Matches the (non-localized) English stderr emitted by Flutter's bin/internal bootstrap
    // scripts when they have to fetch a fresh Dart SDK before running anything. Substrings —
    // not exact lines — because the .sh variant interpolates "$OS $ARCH" into the message.
    // .bat / .sh / .ps1 all hardcode English via plain ECHO / echo / Write-Host.
    static isBootstrapStderr(s: string): boolean
    {
        return s.includes("Checking Dart SDK version")
            || (s.includes("Downloading") && s.includes("Dart SDK"));
    }

    static notifyInProgress(): void
    {
        NotificationTools.notifyInfo(
            "Flutter is updating its bundled Dart SDK before launching dart_format ...",
            "This usually takes under a minute. dart_format will start automatically once Flutter finishes."
        );
    }
}
