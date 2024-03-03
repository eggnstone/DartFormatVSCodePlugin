import vscode from "vscode";
import {LinkInfo} from "../data/LinkInfo";

export class NotificationTools
{
    static createCheckInstallationInstructionsLink(): LinkInfo
    {
        return new LinkInfo("Installation instructions for dart_format", "https://pub.dev/packages/dart_format/install");
    }

    static notifyError(message: string, content: string, actions: LinkInfo[]): void
    {
        // JSIgnoredPromiseFromCall
        this.notifyErrorAsync(message, content, actions);
    }

    static notifyInfo(message: string): void
    {
        // noinspection JSIgnoredPromiseFromCall
        vscode.window.showInformationMessage(message);
    }

    static notifyWarning(message: string): void
    {
        // noinspection JSIgnoredPromiseFromCall
        vscode.window.showWarningMessage(message);
    }

    private static async notifyErrorAsync(message: string, content: string, actions: LinkInfo[]): Promise<void>
    {
        const fixedContent = content
            .replace(/\n/g, " ")
            .replace(/<br\/>/g, " ")
            .replace(/<pre>/g, " ")
            .replace(/<\/pre>/g, " ");
        const linkInfoNames: string[] = actions.map((linkInfo: LinkInfo) => linkInfo.name);
        const linkInfoName = await vscode.window.showErrorMessage<string>(message + " " + fixedContent, ...linkInfoNames);
        NotificationTools.notifyInfo("linkInfoName: " + linkInfoName);
        if (!linkInfoName)
        {
            return;
        }

        const linkInfo = actions.find((linkInfo: LinkInfo) => linkInfo.name === linkInfoName);
        if (linkInfo)
        {
            vscode.env.openExternal(vscode.Uri.parse(linkInfo.url));
        }
    }
}
