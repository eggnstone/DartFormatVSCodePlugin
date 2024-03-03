export class DartFormatClient
{
    private readonly baseUrl: string;

    constructor(baseUrl: string)
    {
        this.baseUrl = baseUrl;
    }

    get(path: string)
    {
        const url = `${this.baseUrl}${path}`;
        const options =
            {
                method: "GET",
                headers:
                    {
                        "User-Agent": "DartFormatPlugin",
                        "Content-Type": "text/plain; charset=utf-8"
                    }
            };

        return fetch(url, options);
    }
}
