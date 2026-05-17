@~/.claude/coding-conventions.md
@~/.claude/typescript-conventions.md

# CLAUDE.md

## Project

VSCode extension (TypeScript) that acts as a client for the [`dart_format`](https://pub.dev/packages/dart_format) pub.dev package. The extension talks HTTP to a local `dart_format` server (installed via `dart pub global activate dart_format`) to format Dart code from inside VSCode.

- Language: **TypeScript**. Entry point: `src/Extension.ts`, compiled to `out/Extension.js`.
- Communication with the formatter happens in `src/DartFormatClient.ts` via `fetch`.
- Marketplace: <https://marketplace.visualstudio.com/items?itemName=eggnstone.DartFormat>.
- Sibling project: JetBrains plugin (same purpose, different IDE) — <https://github.com/eggnstone/DartFormatJetBrainsPlugin>.
- Formatter source: <https://github.com/eggnstone/dart_format>.