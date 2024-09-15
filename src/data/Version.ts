export class Version
{
    private readonly major: number;
    private readonly minor: number;
    private readonly patch: number;

    constructor(major: number, minor: number, patch: number)
    {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
    }

    toString(): String
    {
        return `${this.major}.${this.minor}.${this.patch}`;
    }

    static parse(s: String): Version
    {
        const parts = s.split(".");
        const major = Number.parseInt(parts[0]);
        const minor = Number.parseInt(parts[1]);
        const patch = Number.parseInt(parts[2]);

        return new Version(major, minor, patch);
    }

    static parseOrUndefined(s: String): Version | undefined
    {
        try
        {
            return Version.parse(s);
        }
        catch (e)
        {
            return undefined;
        }
    }

    isOlderThan(otherVersion: Version | undefined): Boolean
    {
        //if (1 == 1) return true;

        if (otherVersion == null)
            return false;

        if (this.major < otherVersion.major)
            return true;

        if (this.major > otherVersion.major)
            return false;

        if (this.minor < otherVersion.minor)
            return true;

        if (this.minor > otherVersion.minor)
            return false;

        return this.patch < otherVersion.patch;
    }
}
