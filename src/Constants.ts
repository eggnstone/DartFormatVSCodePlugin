export class Constants
{
    private static readonly DEBUG = true;

    static readonly CANCEL_PROCESSING_ON_ERROR = !Constants.DEBUG;

    static readonly DEBUG_CONNECTION = Constants.DEBUG && true;
    static readonly DEBUG_FORMAT_ACTION = Constants.DEBUG && true;
    static readonly DEBUG_NOTIFICATION_TOOLS = Constants.DEBUG && true;
    static readonly DEBUG_SETTINGS_DIALOG = Constants.DEBUG && true;

    static readonly HTTP_CLIENT_CONNECT_TIMEOUT_IN_SECONDS = 5;
    static readonly HTTP_CLIENT_CONNECTION_REQUEST_TIMEOUT_IN_SECONDS = 5;

    static readonly REPO_NAME_DART_FORMAT = "DartFormat";
    static readonly REPO_NAME_DART_FORMAT_JET_BRAINS_PLUGIN = "DartFormatVSCodePlugin";

    static readonly SHOW_OPEN_FILE_IN_NOTIFICATION = Constants.DEBUG;
    static readonly SHOW_SLOW_TIMINGS = Constants.DEBUG;
    static readonly SHOW_TIMINGS_EVEN_AFTER_ERROR = Constants.DEBUG;

    static readonly WAIT_FOR_EXTERNAL_DART_FORMAT_START_IN_SECONDS = -1;
    static readonly WAIT_FOR_JOIN_JOB_FORMAT_COMMAND_IN_SECONDS = 60;
    static readonly WAIT_FOR_SEND_JOB_FORMAT_COMMAND_IN_SECONDS = 5;
    static readonly WAIT_FOR_SEND_JOB_QUIT_COMMAND_IN_SECONDS = 5;
    static readonly WAIT_INTERVAL_IN_MILLIS = 100;
}
