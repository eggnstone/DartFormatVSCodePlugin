import {WorkspaceConfiguration} from "vscode";
import {logDebug} from "../tools/LogTools";
import {JsonTools} from "../tools/JsonTools";

export class Config
{
    private readonly addNewLineBeforeOpeningBrace: boolean = false;
    private readonly addNewLineAfterOpeningBrace: boolean = false;
    private readonly addNewLineBeforeClosingBrace: boolean = false;
    private readonly addNewLineAfterClosingBrace: boolean = false;
    private readonly addNewLineAfterSemicolon: boolean = false;
    private readonly addNewLineAtEndOfText: boolean = false;
    private readonly fixSpaces: boolean = false;
    private readonly removeTrailingCommas: boolean = false;
    private readonly indentationSpacesPerLevel: number = -1;
    private readonly maxEmptyLines: number = -1;

    private constructor(configuration: WorkspaceConfiguration)
    {
        const lineBreaks: any = configuration.get("lineBreaks");
        if (lineBreaks)
        {
            const openingBraces: any = lineBreaks["openingBraces"];
            if (openingBraces)
            {
                this.addNewLineBeforeOpeningBrace = openingBraces["addBefore"] ?? false;
                this.addNewLineAfterOpeningBrace = openingBraces["addAfter"] ?? false;
            }

            const closingBraces: any = lineBreaks["closingBraces"];
            if (closingBraces)
            {
                this.addNewLineBeforeClosingBrace = closingBraces["addBefore"] ?? false;
                this.addNewLineAfterClosingBrace = closingBraces["addAfter"] ?? false;
            }

            const semicolon: any = lineBreaks["semicolon"];
            if (semicolon)
                this.addNewLineAfterSemicolon = semicolon["addAfter"] ?? false;

            const endOfFile: any = lineBreaks["endOfFile"];
            if (endOfFile)
                this.addNewLineAtEndOfText = endOfFile["add"] ?? false;
        }

        const spaces: any = configuration.get("spaces");
        if (spaces)
            this.fixSpaces = spaces["fix"] ?? false;

        const removals: any = configuration.get("removals");
        if (removals)
            this.removeTrailingCommas = removals["trailingCommas"] ?? false;

        const indentation: any = configuration.get("indentation");
        if (indentation)
            this.indentationSpacesPerLevel = indentation["spacesPerLevel"] ?? -1;

        const emptyLines: any = configuration.get("emptyLines");
        if (emptyLines)
            this.maxEmptyLines = emptyLines["maxAllowed"] ?? -1;
    }

    static parse(configuration: WorkspaceConfiguration): Config | undefined
    {
        try
        {
            return new Config(configuration);
        }
        catch (e)
        {
            logDebug("Error parsing configuration: " + e);
            return undefined;
        }
    }

    hasNothingEnabled(): boolean
    {
        return !this.addNewLineBeforeOpeningBrace &&
            !this.addNewLineAfterOpeningBrace &&
            !this.addNewLineBeforeClosingBrace &&
            !this.addNewLineAfterClosingBrace &&
            !this.addNewLineAfterSemicolon &&
            !this.addNewLineAtEndOfText &&
            !this.fixSpaces &&
            !this.removeTrailingCommas &&
            this.indentationSpacesPerLevel < 0 &&
            this.maxEmptyLines < 0;
    }

    toJson(): any
    {
        return {
            "AddNewLineBeforeOpeningBrace": this.addNewLineBeforeOpeningBrace,
            "AddNewLineAfterOpeningBrace": this.addNewLineAfterOpeningBrace,
            "AddNewLineBeforeClosingBrace": this.addNewLineBeforeClosingBrace,
            "AddNewLineAfterClosingBrace": this.addNewLineAfterClosingBrace,
            "AddNewLineAfterSemicolon": this.addNewLineAfterSemicolon,
            "AddNewLineAtEndOfText": this.addNewLineAtEndOfText,
            "FixSpaces": this.fixSpaces,
            "RemoveTrailingCommas": this.removeTrailingCommas,
            "IndentationSpacesPerLevel": this.indentationSpacesPerLevel,
            "MaxEmptyLines": this.maxEmptyLines
        };
    }

    toJsonString(): string
    {
        return JsonTools.stringify0(this.toJson());
    }
}
