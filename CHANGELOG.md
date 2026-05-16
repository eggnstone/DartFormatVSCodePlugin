# Change Log

## 2.0.0 (in progress)

- Single-file formatting now uses VSCode's standard format flow (`Shift`+`Alt`+`F`, format-on-save, editor right-click → "Format Document"). The custom `Ctrl`+`Alt`+`,` shortcut and "Format Current File" command have been removed; rebind to `editor.action.formatDocument` in your `keybindings.json` if you want it back.
- Format multiple files at once: Explorer right-click on a folder or multi-selected `.dart` files → "Format with DartFormat". Skips generated files (`.g.dart`, `.freezed.dart`, etc.), `.dart_tool/`, and `build/`. Cancelable progress notification reports per-file progress and a summary at the end.
- Auto-install dart_format on first start, auto-update when a newer version is announced, and auto-recover from a stale snapshot after a Dart SDK upgrade.
- macOS / Linux: dart_format is now launched via `$SHELL -ilc`, so `.zshrc` / `.bashrc` / `.zprofile` / `.bash_profile` are sourced and the user's interactive PATH (where `dart` / `flutter` live) is available. Fixes "couldn't find dart" failures when VSCode is launched from a desktop env that doesn't load shell rc files.
- Honour the `PUB_CACHE` environment variable on macOS and Linux (previously only on Windows).
- Fixed truncated output on larger files.
- Refuse to format files larger than dart_format's 4 MiB request limit, with a clear message instead of a round-trip server error.
- Show a useful error message instead of crashing when dart_format returns an unexpected error response.
- Cleaner shutdown: no more "DartFormat is stopping/stopped" notifications or fake startup delay; dart_format is signalled to quit cleanly when VSCode closes.
- Quieter startup: no more "process is alive" / "is ready" notifications. If you try to format while dart_format is still starting, you'll see a one-time "please wait" notification; the format is queued and runs automatically as soon as it's ready.

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
