export class Constants
{
    private static readonly DEBUG = false;

    static readonly CANCEL_PROCESSING_ON_ERROR = !Constants.DEBUG;

    static readonly DEBUG_CONNECTION = Constants.DEBUG && false;
    static readonly DEBUG_FORMAT_ACTION = Constants.DEBUG && false;
    static readonly DEBUG_JSON_TOOLS = Constants.DEBUG && false;
    static readonly DEBUG_NOTIFICATION_TOOLS = Constants.DEBUG && false;
    static readonly DEBUG_SETTINGS_DIALOG = Constants.DEBUG && false;
    static readonly DEBUG_STARTUP = Constants.DEBUG && false;
    static readonly DEBUG_STREAM_READER = Constants.DEBUG && false;
    static readonly DEBUG_TIMED_READER = Constants.DEBUG && false;

    // Test toggles. Flip each to true (in dev) to exercise the matching auto-recovery path.
    static readonly DEBUG_FAKE_KERNEL_MISMATCH = Constants.DEBUG && false;  // pretend dart_format exited with the stale-snapshot stderr
    static readonly DEBUG_FAKE_NEW_VERSION = Constants.DEBUG && false;      // pretend the announced latest version is way ahead
    static readonly DEBUG_FAKE_FORMAT_DELAY = Constants.DEBUG && false;     // 5 s cancelable sleep before each format, to test the Cancel button

    static readonly HTTP_CLIENT_CONNECT_TIMEOUT_IN_SECONDS = 5;
    static readonly HTTP_CLIENT_CONNECTION_REQUEST_TIMEOUT_IN_SECONDS = 5;

    // Mirrors dart_format's server-side cap (4 MiB). We pre-check the text
    // size so the user gets a useful message before the round-trip 413.
    static readonly MAX_REQUEST_BODY_SIZE_IN_BYTES = 4 * 1024 * 1024;

    static readonly SHOW_OPEN_FILE_IN_NOTIFICATION = Constants.DEBUG;
    static readonly SHOW_SLOW_TIMINGS = Constants.DEBUG;
    static readonly SHOW_TIMINGS_EVEN_AFTER_ERROR = Constants.DEBUG;

    static readonly WAIT_FOR_EXTERNAL_DART_FORMAT_START_IN_SECONDS = -1;
    static readonly WAIT_FOR_EXTERNAL_INSTALL_DART_FORMAT_START_IN_SECONDS = 60;
    static readonly WAIT_FOR_JOIN_JOB_FORMAT_COMMAND_IN_SECONDS = 60;
    static readonly WAIT_FOR_SEND_JOB_FORMAT_COMMAND_IN_SECONDS = 5;
    static readonly WAIT_FOR_SEND_JOB_QUIT_COMMAND_IN_SECONDS = 5;
    static readonly WAIT_INTERVAL_IN_MILLIS = 100;
}
