/**
 * SchoolOS AI Orchestrator Types
 * Defines the contract for tasks, execution results, and runtime options.
 */

export interface ExecutorTask {
  /** Unique task identifier */
  id: string;
  /** Short human-readable title */
  title: string;
  /** Detailed description of the task requirements */
  description?: string;
  /** The non-interactive prompt passed to Antigravity CLI */
  prompt: string;
  /** Target workspace directory (defaults to repository root) */
  workspacePath?: string;
  /** Optional execution timeout in milliseconds */
  timeoutMs?: number;
  /** Target files associated with the task */
  targetFiles?: string[];
  /** Expected project phase */
  phase?: string;
  /** ISO timestamp when task was created */
  createdAt?: string;
  /** Optional environment variable overrides */
  environmentVariables?: Record<string, string>;
}

export interface ExecutorResult {
  /** ID of the executed task */
  taskId: string;
  /** Whether the process completed with exit code 0 and without uncaught errors */
  success: boolean;
  /** The executable binary invoked */
  command: string;
  /** The argument array passed to spawn */
  args: string[];
  /** Working directory where the command was targeted */
  workspacePath: string;
  /** ISO timestamp when execution started */
  startTime: string;
  /** ISO timestamp when execution completed */
  endTime: string;
  /** Duration of execution in milliseconds */
  durationMs: number;
  /** Process exit code (null if killed or failed before exit) */
  exitCode: number | null;
  /** Process exit signal (e.g., SIGTERM, SIGKILL) */
  signal: NodeJS.Signals | null;
  /** Standard output captured from the process */
  stdout: string;
  /** Standard error captured from the process */
  stderr: string;
  /** Error message if process failed to spawn or threw an exception */
  error?: string;
  /** Indicates whether this was a dry-run simulation */
  dryRun: boolean;
}

export interface ExecutorOptions {
  /** Workspace directory path (overrides task and default) */
  workspacePath?: string;
  /** If true (default), simulates execution without launching Antigravity */
  dryRun?: boolean;
  /** Timeout in milliseconds before process is terminated */
  timeoutMs?: number;
  /** Custom binary path if agy is not on standard PATH */
  customAgyBinary?: string;
}
