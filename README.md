# DartFormat

**A formatter for Dart.**

Like dartfmt.  
But better ;)  
Because it's configurable.

**How to format:**  
- `Shift`+`Alt`+`F` — standard "Format Document" command.  
- Editor right-click → "Format Document".  
- Format-on-save (see *Setup* below).  
- Explorer right-click on a folder or multi-selected `.dart` files → "Format with DartFormat".

**Setup:**  
If you also have the official Dart extension (Dart-Code) installed — which most people do — VSCode sees two formatters for `.dart` files and won't pick one for you. Add this to your settings.json so VSCode knows to use DartFormat for `.dart` files (and so format-on-save works):
```json
"[dart]": {
    "editor.defaultFormatter": "eggnstone.DartFormat",
    "editor.formatOnSave": true
}
```
Without `editor.defaultFormatter`, `Shift`+`Alt`+`F` will prompt you to pick a formatter each time, and format-on-save will silently do nothing.

You also need to enable at least one of the `dartFormat.*` options in settings (e.g. `dartFormat.spaces.fix`) — without any options enabled, DartFormat is a no-op.

**dart_format installation:**  
The extension uses the [dart_format](https://pub.dev/packages/dart_format) package on [pub.dev](https://pub.dev). It is installed and kept up to date automatically; you don't need to run anything manually. The equivalent manual command is:  
`dart pub global activate dart_format`

**This extension:**  
Source code: <a href="https://github.com/eggnstone/DartFormatVSCodePlugin">DartFormatVSCodePlugin on GitHub</a>  
Problems and feature requests: <a href="https://github.com/eggnstone/DartFormatVSCodePlugin/issues">GitHub Issues for DartFormatVSCodePlugin</a>  

**External dart_format package:**  
Source code: <a href="https://github.com/eggnstone/dart_format/">dart_format on GitHub</a>  
Problems and feature requests: <a href="https://github.com/eggnstone/dart_format/issues">GitHub Issues for dart_format</a>  

**Also available as a plugin for JetBrains (Android Studio, IntelliJ IDEA, ...)**  
[DartFormat plugin at the JetBrains Marketplace](https://plugins.jetbrains.com/plugin/21003-dartformat)
