export class Tools
{
    static async sleep(millis: number): Promise<void>
    {
        return new Promise<void>(resolve => setTimeout(resolve, millis));
    }
}
