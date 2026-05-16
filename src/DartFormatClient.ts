import {FormData} from "./data/FormData";

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
                        "Content-Type": "text/plain; charset=utf-8",
                        "X-DartFormat-Client": "1"
                    }
            };

        return fetch(url, options);
    }

    post(path: string, formData: FormData): Promise<Response>
    {
        const url = `${this.baseUrl}${path}`;
        const options = formData.generate();
        return fetch(url, options);
    }
}
