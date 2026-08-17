import * as fs from 'node:fs';
import * as path from 'node:path';
import { executeAntigravityTask, DEFAULT_WORKSPACE_PATH } from './antigravity';
import { ExecutorOptions, ExecutorTask } from './types';

function printUsage(): void {
  console.log(`
SchoolOS AI Orchestrator — Antigravity Executor Prototype

USAGE:
  node dist/index.js [options]

OPTIONS:
  --task, -t <file>       Path to JSON task definition file
  --execute               Explicitly execute the task via Antigravity CLI (Default is DRY-RUN)
  --workspace, -w <path>  Target workspace path (default: repository root)
  --timeout <ms>          Execution timeout in milliseconds
  --help, -h              Display this help message

SAFETY NOTICE:
  By default, all tasks run in DRY-RUN mode.
  No subprocess is launched unless '--execute' is explicitly provided.
`);
}

function parseCliArgs(): {
  taskPath?: string;
  isExecute: boolean;
  workspacePath?: string;
  timeoutMs?: number;
  showHelp: boolean;
} {
  const args = process.argv.slice(2);
  let taskPath: string | undefined;
  let isExecute = false;
  let workspacePath: string | undefined;
  let timeoutMs: number | undefined;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg === '--execute') {
      isExecute = true;
    } else if ((arg === '--task' || arg === '-t') && i + 1 < args.length) {
      taskPath = args[++i];
    } else if ((arg === '--workspace' || arg === '-w') && i + 1 < args.length) {
      workspacePath = args[++i];
    } else if (arg === '--timeout' && i + 1 < args.length) {
      const parsed = parseInt(args[++i], 10);
      if (!isNaN(parsed)) {
        timeoutMs = parsed;
      }
    }
  }

  return { taskPath, isExecute, workspacePath, timeoutMs, showHelp };
}

function loadTask(taskPath?: string): ExecutorTask {
  if (taskPath) {
    const resolvedPath = path.resolve(process.cwd(), taskPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[ERROR] Task file not found: ${resolvedPath}`);
      process.exit(1);
    }
    try {
      const rawContent = fs.readFileSync(resolvedPath, 'utf-8');
      const parsed = JSON.parse(rawContent) as ExecutorTask;
      if (!parsed.id || !parsed.prompt) {
        console.error('[ERROR] Task file must contain at least "id" and "prompt" properties.');
        process.exit(1);
      }
      return parsed;
    } catch (err: any) {
      console.error(`[ERROR] Failed to parse task file: ${err.message}`);
      process.exit(1);
    }
  }

  // Fallback sample inspection task for dry-run verification
  return {
    id: 'TASK-SAMPLE-001',
    title: 'Sample Inspection Task (Dry-Run Verification)',
    description: 'Dry-run inspection of SchoolOS repository state.',
    prompt: 'Perform a read-only check of repository state. Do not modify files.',
    phase: 'Phase 2B preparation',
    createdAt: new Date().toISOString(),
  };
}

async function main(): Promise<void> {
  const { taskPath, isExecute, workspacePath, timeoutMs, showHelp } = parseCliArgs();

  if (showHelp) {
    printUsage();
    process.exit(0);
  }

  const task = loadTask(taskPath);
  const options: ExecutorOptions = {
    workspacePath: workspacePath || DEFAULT_WORKSPACE_PATH,
    dryRun: !isExecute, // Safe default: DRY-RUN is active unless --execute is passed
    timeoutMs,
  };

  console.log('====================================================');
  console.log('SchoolOS AI Orchestrator — Antigravity Executor');
  console.log('====================================================');
  console.log(`Task ID:        ${task.id}`);
  console.log(`Task Title:     ${task.title}`);
  console.log(`Mode:           ${options.dryRun ? 'DRY-RUN (Safe Simulation)' : 'LIVE EXECUTION (Subprocess Enabled)'}`);
  console.log(`Workspace Root: ${options.workspacePath}`);
  console.log('----------------------------------------------------');
  console.log('Prompt to be passed to Antigravity CLI:');
  console.log(`"${task.prompt}"`);
  console.log('----------------------------------------------------');

  if (options.dryRun) {
    console.log('[SAFETY NOTICE] Running in DRY-RUN mode. No Antigravity subprocess will be spawned.');
    console.log('To execute against Antigravity, explicitly supply the --execute flag.');
  }

  const result = await executeAntigravityTask(task, options);

  console.log('----------------------------------------------------');
  console.log('Execution Result:');
  console.log(`Success:    ${result.success}`);
  console.log(`Exit Code:  ${result.exitCode ?? 'N/A'}`);
  console.log(`Duration:   ${result.durationMs}ms`);
  console.log(`Start Time: ${result.startTime}`);
  console.log(`End Time:   ${result.endTime}`);
  if (result.stdout) {
    console.log('\n[Process Output / Command]:');
    console.log(result.stdout);
  }
  if (result.stderr) {
    console.log('\n[Process Stderr]:');
    console.log(result.stderr);
  }
  if (result.error) {
    console.log(`\n[Process Error]: ${result.error}`);
  }
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('[UNHANDLED ERROR]', err);
  process.exit(1);
});
