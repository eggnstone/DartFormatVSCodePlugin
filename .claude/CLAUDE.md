@~/.claude/coding-conventions.md
@~/.claude/typescript-conventions.md

# DartFormatVSCodePlugin

VSCode extension (TypeScript) — a client for the [`dart_format`](https://pub.dev/packages/dart_format) pub.dev package. The extension talks HTTP to a local `dart_format` server (installed via `dart pub global activate dart_format`) to format Dart code from inside VSCode.

- Language: **TypeScript**.
- Build: TypeScript compiler (`tsc`) + npm scripts. Packaging via `vsce` (Visual Studio Code Extensions CLI).
- Marketplace: <https://marketplace.visualstudio.com/items?itemName=eggnstone.DartFormat>.
- Sibling project: JetBrains plugin — <https://github.com/eggnstone/DartFormatJetBrainsPlugin>.
- Formatter source: <https://github.com/eggnstone/dart_format>.

## Project context

- Stability: feature-stable.
- Breaking changes: none within a major version.
- Coupling — critical: this extension's reason for existing is to wrap the `dart_format` HTTP wire protocol. Any change in the dart_format CLI flags or `POST /format` request/response shape requires a lockstep update here. Conversely, this extension must never depend on dart_format internals — only the CLI and wire protocol.
- Sibling parity: features added in this extension should usually also land in the JetBrains sibling, and vice versa. Naming, settings, and behavior should match where possible to keep user mental models aligned.
- Public surface: the extension's "public API" is the user-facing commands (`contributes.commands`), settings (`contributes.configuration`), and activation events declared in `package.json`. Breaking changes to those affect users and require a major version bump.

## Architecture

Entry point: `src/Extension.ts`, compiled to `out/Extension.js`.

Key components:

- `src/DartFormatClient.ts` — `fetch`-based HTTP client that talks to the local `dart_format` server. Owns request construction, response parsing, error mapping, and timeout handling. **This is the protocol boundary.** Any wire-protocol change starts and ends here.
- [Commands/ — format-document / format-selection commands — fill in actual folder/file names]
- [Settings/ — extension settings access — fill in]
- [Process/ — dart_format server lifecycle management (spawn, port discovery, shutdown) — fill in]

`package.json` — VSCode extension manifest. Declares:
- `engines.vscode` — minimum VSCode version supported.
- `activationEvents` — when the extension loads.
- `contributes.commands` — commands users can invoke (Command Palette, keyboard shortcuts).
- `contributes.configuration` — extension settings exposed in VSCode preferences.
- `contributes.languages` / `contributes.menus` — language associations and menu integration.

Any new command, setting, or activation trigger lands in `package.json`.

### Build and run

- `npm run watch` — TypeScript compiler in watch mode. Primary dev loop alongside the VSCode "Extension Development Host" (F5 in VSCode).
- `npm run compile` — one-shot compile to `out/`.
- `vsce package` — produces the marketplace-ready `.vsix` file.
- `vsce publish` — uploads to the VSCode Marketplace (requires a Personal Access Token from Azure DevOps; never commit it).

### Testing

[Fill in: `@vscode/test-electron` extension tests in `src/test/`? Manual testing via the Extension Development Host? Both?]

## Recurring tasks

### When the `dart_format` wire protocol changes

1. Read the dart_format changelog for the new release.
2. Update `src/DartFormatClient.ts` to match the new request/response shape (multipart parts, JSON fields, status codes).
3. If the CLI flags changed (e.g. `--port`, `--web`), update the server-spawn logic accordingly.
4. Bump the minimum required dart_format version in the extension's user-facing docs / settings hint.
5. Test against a freshly-activated dart_format from pub.dev: `dart pub global activate dart_format`, then F5 in VSCode to launch the Extension Development Host.
6. Mirror the same wire-protocol fix in the JetBrains sibling plugin in the same release window.

### When publishing a new version

1. Bump the version in `package.json`.
2. Update `CHANGELOG.md` — past-tense, brief, per the global changelog style.
3. `npm run compile` — must build cleanly with no TS errors.
4. `vsce package` — verify the `.vsix` locally; install it into a clean VSCode profile and smoke-test.
5. `vsce publish` (or upload the `.vsix` manually via marketplace.visualstudio.com).
6. VSCode Marketplace approval is usually near-instant for routine updates, but reserve a few hours in case of automated scans flagging something.
7. Tag the release in Git after marketplace approval.
8. If this release tracks a new dart_format version, note the minimum compatible dart_format version in the marketplace description.

### When the VSCode minimum version changes

1. Update `engines.vscode` in `package.json`.
2. Check the VSCode Extension API changelog for any newly-available APIs you can simplify down to, or any deprecations you need to address.
3. Smoke test in the new minimum version via the Extension Development Host.
4. If dropping support for an older VSCode version, note it prominently in the changelog — users on those versions will stop getting updates.

### When the JetBrains sibling plugin gets a new feature

1. Determine if the feature is wire-protocol-driven (lives in `dart_format`) or plugin-only (UI/UX).
2. If wire-protocol: it's automatically available here once `DartFormatClient.ts` handles the new shape — just expose it via a command or setting.
3. If plugin-only: re-implement the equivalent command/setting in TypeScript, matching the JetBrains version's naming, default behavior, and settings keys where reasonable.
4. Update both plugin marketplaces in the same release window so users on either IDE see the feature land together.

### When debugging "can't connect to dart_format server" reports

1. Reproduce: `dart pub global activate dart_format`, then F5 in VSCode.
2. Check the server-spawn logs — `dart_format --web` prints a JSON line with the chosen port on stdout. The extension must read that line, not assume a port.
3. Common causes: stale background `dart_format` process holding a port (kill via `/quit` endpoint or OS-level), PATH issues finding the `dart` executable on Windows vs macOS, firewall blocking 127.0.0.1 traffic (rare but happens on locked-down corp machines).
4. If the request shape changed in a recent dart_format release, the symptom looks like a connection error but is actually a 4xx response — check `DartFormatClient.ts` error mapping.