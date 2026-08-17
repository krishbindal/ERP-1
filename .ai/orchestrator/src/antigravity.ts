import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { ExecutorOptions, ExecutorResult, ExecutorTask } from './types';

/**
 * Default workspace root for SchoolOS.
 */
export const DEFAULT_WORKSPACE_PATH = path.resolve(__dirname, '../../..');

/**
 * Resolves the appropriate Antigravity CLI binary name depending on the operating system.
 */
export function getAntigravityBinary(customPath?: string): string {
  if (customPath) {
    return customPath;
  }
  return process.platform === 'win32' ? 'agy.cmd' : 'agy';
}

/**
 * Constructs the argument list for the non-interactive Antigravity CLI invocation:
 * agy -p "<prompt>" --cwd "<workspace>"
 *
 * Uses an argument array to prevent shell injection vulnerabilities.
 */
export function buildAgyArgs(task: ExecutorTask, workspacePath: string): string[] {
  return [
    '-p',
    task.prompt,
    '--cwd',
    task.workspacePath || workspacePath,
  ];
}

/**
 * Executes or simulates an Antigravity task.
 *
 * Defaults to safe DRY-RUN mode unless options.dryRun is explicitly set to false.
 */
export async function executeAntigravityTask(
  task: ExecutorTask,
  options: ExecutorOptions = {}
): Promise<ExecutorResult> {
  const workspacePath = task.workspacePath || options.workspacePath || DEFAULT_WORKSPACE_PATH;
  const isDryRun = options.dryRun !== false; // Default to DRY-RUN for safety
  const binary = getAntigravityBinary(options.customAgyBinary);
  const args = buildAgyArgs(task, workspacePath);

  const startTimeDate = new Date();
  const startTime = startTimeDate.toISOString();

  // DRY-RUN SIMULATION (Safe default)
  if (isDryRun) {
    const endTimeDate = new Date();
    const formattedCommand = `${binary} ${args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg)).join(' ')}`;

    return {
      taskId: task.id,
      success: true,
      command: binary,
      args,
      workspacePath,
      startTime,
      endTime: endTimeDate.toISOString(),
      durationMs: endTimeDate.getTime() - startTimeDate.getTime(),
      exitCode: 0,
      signal: null,
      stdout: `[DRY-RUN] Execution simulated. No subprocess spawned.\nCommand: ${formattedCommand}\nWorkspace: ${workspacePath}`,
      stderr: '',
      dryRun: true,
    };
  }

  // LIVE EXECUTION MODE (Explicitly enabled via options.dryRun === false)
  return new Promise<ExecutorResult>((resolve) => {
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    // Use spawn with argument array (avoids shell concatenation injection)
    const proc = spawn(binary, args, {
      cwd: workspacePath,
      shell: process.platform === 'win32', // Required for Windows .cmd batch file resolution
      windowsHide: true,
      env: {
        ...process.env,
        ...task.environmentVariables,
      },
    });

    const timeoutMs = options.timeoutMs || task.timeoutMs;
    let timer: NodeJS.Timeout | undefined;

    if (timeoutMs && timeoutMs > 0) {
      timer = setTimeout(() => {
        proc.kill('SIGTERM');
      }, timeoutMs);
    }

    proc.stdout?.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    proc.on('error', (err: Error) => {
      if (timer) clearTimeout(timer);
      const endTimeDate = new Date();
      resolve({
        taskId: task.id,
        success: false,
        command: binary,
        args,
        workspacePath,
        startTime,
        endTime: endTimeDate.toISOString(),
        durationMs: endTimeDate.getTime() - startTimeDate.getTime(),
        exitCode: null,
        signal: null,
        stdout: Buffer.concat(stdoutChunks).toString('utf-8'),
        stderr: Buffer.concat(stderrChunks).toString('utf-8'),
        error: err.message,
        dryRun: false,
      });
    });

    proc.on('close', (code: number | null, signal: NodeJS.Signals | null) => {
      if (timer) clearTimeout(timer);
      const endTimeDate = new Date();
      const stdout = Buffer.concat(stdoutChunks).toString('utf-8');
      const stderr = Buffer.concat(stderrChunks).toString('utf-8');

      resolve({
        taskId: task.id,
        success: code === 0,
        command: binary,
        args,
        workspacePath,
        startTime,
        endTime: endTimeDate.toISOString(),
        durationMs: endTimeDate.getTime() - startTimeDate.getTime(),
        exitCode: code,
        signal,
        stdout,
        stderr,
        dryRun: false,
      });
    });
  });
}
