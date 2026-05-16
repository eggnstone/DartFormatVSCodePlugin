import {logDebug} from "./LogTools";
import {Constants} from "../Constants";

export class JsonTools
{
    static stringify0(value: unknown): string
    {
        return JSON.stringify(value, null, 0);
    }

    static stringify4(value: unknown): string
    {
        return JSON.stringify(value, null, 4);
    }

    static parseOrUndefined(jsonEncodedResponse: string): unknown
    {
        try
        {
            return JSON.parse(jsonEncodedResponse);
        }
        catch
        {
            return undefined;
        }
    }

    static getString(json: unknown, key: string, def: string): string
    {
        if (Constants.DEBUG_JSON_TOOLS)
            logDebug(`JsonTools.getString("${key}", "${def}")`);

        return JsonTools.getOrUndefined(json, key)?.toString() ?? def;
    }

    static getIntOrUndefined(json: unknown, key: string): number | undefined
    {
        if (Constants.DEBUG_JSON_TOOLS)
            logDebug(`JsonTools.getIntOrUndefined("${key}")`);

        const value = JsonTools.getOrUndefined(json, key);
        return typeof value === "number" ? value : undefined;
    }

    static getOrUndefined(json: unknown, key: string): unknown
    {
        if (Constants.DEBUG_JSON_TOOLS)
            logDebug(`JsonTools.getOrUndefined("${key}")`);

        if (typeof json !== "object" || json === null)
            return undefined;

        return (json as Record<string, unknown>)[key];
    }
}
