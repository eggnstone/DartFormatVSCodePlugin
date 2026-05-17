# Change Log

## 2.0.0

- Single-file formatting now uses VSCode's standard format flow; the custom `Ctrl`+`Alt`+`,` shortcut and "Format Current File" command are removed.
- Format multiple files via Explorer right-click on folders or multi-selected `.dart` files; skips generated files, `.dart_tool/`, and `build/`.
- Auto-install dart_format on first start.
- Auto-update when a newer version is announced.
- Auto-recover from a stale snapshot after a Dart SDK upgrade.
- Launch dart_format via `$SHELL -ilc` on macOS / Linux so the user's interactive PATH is available.
- Honour the `PUB_CACHE` environment variable on macOS and Linux (previously only on Windows).
- Fixed truncated output on larger files.
- Reject files larger than dart_format's 4 MiB request limit.
- Show a useful error message when dart_format returns an unexpected error response.
- Cleaner shutdown: dart_format is signalled to quit when VSCode closes.
- Quieter startup: no more "process is alive" / "is ready" notifications.
- Format requests issued while dart_format is starting are queued and run when ready, with a one-time "please wait" notification.
- Welcome notification on first activation with the default format shortcut.
- Notify while Flutter is downloading the Dart SDK during dart_format startup.

## 1.0.0

- "Fix spaces" now not experimental anymore.

## 0.3.3

- Fixed startup problems on Linux/macOS.

## 0.3.0

- Added install/update actions.

## 0.2.2

- Added settings.

## 0.1.3

- Fixed startup problem (spawn EINVAL).

## 0.1.2

- Improved readme.

## 0.1.0

- Initial release
