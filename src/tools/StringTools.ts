export class StringTools
{
    static toDisplayString(s: string, maxLength: number = -1): string
    {
        return `"${StringTools.toSafeString(s, maxLength)}"`;
    }

    static toSafeString(o: unknown, maxLength: number = -1): string
    {
        if (o === null)
            return "<null>";

        if (o === undefined)
            return "<undefined>";

        const s = String(o);
        let r = s.replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
        if (maxLength >= 0 && r.length > maxLength)
            r = r.substring(0, maxLength) + "...";

        return r;
    }
}
