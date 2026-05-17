import vscode from "vscode";
import {Constants} from "../Constants";

export class WelcomeNotification
{
    private static readonly STATE_KEY = "welcomeShown";

    static async tryShow(context: vscode.ExtensionContext): Promise<void>
    {
        if (!Constants.DEBUG_FAKE_SHOW_WELCOME)
        {
            const alreadyShown = context.globalState.get<boolean>(WelcomeNotification.STATE_KEY);
            if (alreadyShown)
                return;

            // Persist first so a dismissal during shutdown can't re-fire next launch.
            await context.globalState.update(WelcomeNotification.STATE_KEY, true);
        }

        const shortcut = WelcomeNotification.getDefaultFormatShortcut();
        const message = `Welcome to DartFormat! The default shortcut to format a Dart file is ${shortcut}; or right-click a folder or .dart files in the Explorer to format multiple at once.`;

        const settingsAction = "Open Settings";
        const keybindingsAction = "Open Keybindings";

        const chosen = await vscode.window.showInformationMessage(message, settingsAction, keybindingsAction);
        if (chosen === settingsAction)
            void vscode.commands.executeCommand("workbench.action.openSettings", "@ext:eggnstone.DartFormat");
        else if (chosen === keybindingsAction)
            void vscode.commands.executeCommand("workbench.action.openGlobalKeybindings", "editor.action.formatDocument");
    }

    private static getDefaultFormatShortcut(): string
    {
        switch (process.platform)
        {
            case "darwin":
                return "Shift+Option+F";
            case "linux":
                return "Ctrl+Shift+I";
            default:
                return "Shift+Alt+F";
        }
    }
}
