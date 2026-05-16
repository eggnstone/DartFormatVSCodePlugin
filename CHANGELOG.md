# Change Log

## 1.1.0 (in progress)

- Fixed truncated output on larger files.
- Show a useful error message instead of crashing when dart_format returns an unexpected error response.
- Honour the `PUB_CACHE` environment variable on macOS and Linux (previously only on Windows).
- Ignore repeated Format shortcut presses while a format is already running.
- DartFormat is now offered as a Format Document provider for Dart files, so "Format Document" (`Shift+Alt+F`) and format-on-save can route through it.
- Removed the "DartFormat is stopping/stopped" notifications and the half-second startup delay on shutdown; dart_format is now signalled to quit cleanly when VSCode closes.

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
