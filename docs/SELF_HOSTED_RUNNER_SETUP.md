# Self-Hosted Runner Setup

## 1. Prerequisites
- Windows 11 x64 Machine
- Git, Node.js (v20), npm, Docker Desktop, Supabase CLI installed.

## 2. Installation
1. Go to `Settings -> Actions -> Runners -> New self-hosted runner` in the GitHub Repository.
2. Select Windows and x64 architecture.
3. Open PowerShell as Administrator and create the recommended directory:
   ```powershell
   mkdir C:\actions-runner
   cd C:\actions-runner
   ```
4. Download and extract the runner package as provided by GitHub.
5. Configure the runner:
   ```powershell
   .\config.cmd --url https://github.com/krishbindal/ERP-1 --token <YOUR_TOKEN> --labels self-hosted,windows,schoolos-ci
   ```
6. Install as a Windows Service:
   ```powershell
   .\svc.cmd install
   .\svc.cmd start
   ```

## 3. Maintenance & Recovery
- The runner runs as a persistent service.
- If the runner goes offline, check the Windows Services dashboard for the `GitHub Actions Runner` service and restart it.
- Never place production secrets on this machine.
