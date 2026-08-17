# SchoolOS — Local Antigravity Executor Prototype

## 1. Overview
This package (`.ai/orchestrator/`) is a lightweight TypeScript prototype designed to interface with the local Google Antigravity CLI (`agy`). It serves as the foundation for the Antigravity execution engine within the SchoolOS AI Orchestration layer.

## 2. Operating Modes

### Safe DRY-RUN Mode (Default)
By default, all commands execute in **DRY-RUN mode**. In this mode:
* The executor parses and validates the task file.
* It resolves the target workspace and builds the exact argument array.
* It prints the command that would be run and returns a simulated success result.
* **No subprocess is spawned**, and Antigravity is **not** launched.

```bash
# Run in default dry-run mode (with sample task)
npm run dry-run

# Run dry-run against a specific task file
npm run dry-run -- --task ../queue/pending/task-001.json
```

### Live Execution Mode (Explicit Flag Required)
Live execution of the Antigravity CLI subprocess is **strictly disabled by default** and only triggers when `--execute` is explicitly passed:

```bash
# Explicitly execute task via Antigravity CLI
npm run execute -- --task ../queue/pending/task-001.json
```

## 3. Subprocess Invocation Mechanism
The executor invokes the installed Antigravity CLI using Node.js `child_process.spawn` with direct argument arrays:

```text
Binary: agy (or agy.cmd on Windows)
Arguments: ["-p", "<prompt>", "--cwd", "<workspace_root>"]
```

### Safety & Argument Handling
* **No Shell Injection**: Arguments are passed as discrete strings in an array rather than concatenated into a single shell command string.
* **Non-Interactive Mode**: Uses the `-p` (`--prompt`) flag to run Antigravity in non-interactive CLI mode rather than launching an interactive TUI.
* **Output Stream Capture**: Streams `stdout` and `stderr` into buffers, records precise millisecond durations, and captures exit codes and termination signals.

## 4. Safety Guardrails & Policy Compliance
* **Not Autonomous**: This prototype does not run in a continuous loop, does not auto-retry failed tasks, and does not monitor file queues autonomously.
* **Prohibited Autonomous Actions**: The executor adheres to `.ai/config/autonomy-policy.md`. It will never automatically execute `git push`, deploy to production, modify production databases, handle credentials/secrets, or disable Row Level Security (RLS).
* **Future OpenAI Integration**: OpenAI planning, task generation, and review validation represent subsequent stages. No OpenAI API keys are configured or required at this stage.

## 5. Development & Typechecking
```bash
# Install dependencies
npm install

# Run static type validation
npm run typecheck

# Build TypeScript to JavaScript (dist/)
npm run build
```
