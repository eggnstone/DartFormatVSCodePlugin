import {ChildProcess} from "node:child_process";
import {Readable} from "node:stream";
import {logDebug} from "../tools/LogTools";
import {SendHandle, Serializable} from "child_process";

export class Process
{
    private readonly childProcess: ChildProcess;
    private _isAlive: boolean;

    stdOut: Readable;
    stdErr: Readable;

    constructor(childProcess: ChildProcess)
    {
        this.childProcess = childProcess;
        this._isAlive = childProcess.pid !== undefined;
        this.stdOut = this.childProcess.stdout as Readable;
        this.stdErr = this.childProcess.stderr as Readable;

        this.childProcess.on("close", (code: number | null, signal: NodeJS.Signals | null) =>
        {
            logDebug("Process.onClose(" + code + ", " + signal + ")");
            this._isAlive = false;
        });

        this.childProcess.on("disconnect", () =>
        {
            logDebug("Process.onDisconnect()");
            this._isAlive = false;
        });

        this.childProcess.on("error", (err: Error) =>
        {
            logDebug("Process.onError(" + err + ")");
            this._isAlive = false;
        });

        this.childProcess.on("exit", (code: number | null, signal: NodeJS.Signals | null) =>
        {
            logDebug(`Process.onExit(${code}, ${signal})`);
            this._isAlive = false;
        });

        this.childProcess.on("message", (message: Serializable, sendHandle: SendHandle) =>
        {
            logDebug(`Process.onMessage(${message}, ${sendHandle})`);
        });
    }

    isAlive(): boolean
    {
        return this._isAlive;
    }

    exitCode() : number | null
    {
        return this.childProcess.exitCode;
    }
}
