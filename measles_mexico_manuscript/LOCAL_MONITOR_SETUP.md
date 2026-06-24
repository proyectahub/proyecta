# Local SSH Monitor Setup Guide

## What It Does

The `monitor_local.py` script lets you monitor your measles manuscript project **from your local machine** while the work runs on a remote server. Real-time progress bars, task status, and file generation tracking - all in your terminal.

---

## Prerequisites

### 1. **SSH Client** (Required)

**Windows:**
- Option A: Install Git Bash
  - Download: https://git-scm.com/download/win
  - Includes `ssh` command
  
- Option B: Windows 10+ (built-in)
  - Already has OpenSSH (just use Command Prompt or PowerShell)
  
- Option C: PuTTY + plink
  - Download: https://www.putty.org/

**Mac:**
- SSH is built-in (just open Terminal)

**Linux:**
- SSH is built-in

### 2. **Python 3.7+**

Check:
```bash
python3 --version
```

Should show: `Python 3.7.0` or newer

### 3. **SSH Access to Remote Server**

You need:
- Server hostname or IP address
- SSH username
- SSH password OR SSH key file
- Path to project on remote server

---

## Installation

### Step 1: Copy Script to Local Machine

Copy `monitor_local.py` to your local machine (anywhere convenient):

```bash
# Example: Save to your Documents folder or project directory
C:\Users\YourName\Documents\monitor_local.py
```

### Step 2: Test Python

```bash
# Windows Command Prompt or PowerShell
python monitor_local.py --help
```

Should show help text with usage examples.

---

## Initial Setup

### First Time: Interactive Configuration

```bash
python monitor_local.py
```

This will prompt you for:

```
MEASLES MONITOR - INITIAL SETUP
================================

SSH Host [example.com]: server.com
SSH User [username]: jsmith
SSH Port [22]: 22
SSH Key File (leave blank for password): [just press Enter]
Remote Project Path [/home/jsmith/measles_mexico_manuscript]: [press Enter or type custom path]

Configuration Summary:
======================
Host:           server.com
User:           jsmith
Port:           22
Key:            Password auth
Project Path:   /home/jsmith/measles_mexico_manuscript

Save configuration? (y/n): y
Test SSH connection? (y/n): y
```

After this, the script will:
1. ✓ Save configuration locally
2. ✓ Test SSH connection
3. Ready to use!

---

## Usage

### Option 1: Single Status Check

```bash
python monitor_local.py
```

**Output:**
- Single status display
- Shows all phases, tasks, and file status
- Exits immediately

**Use for:** Quick checks, cron jobs, CI/CD

### Option 2: Live Monitoring (5-second updates)

```bash
python monitor_local.py --watch
```

**Output:**
- Updates every 5 seconds
- Live progress bars
- Press Ctrl+C to stop

**Use for:** Active development, real-time tracking

### Option 3: Custom Update Interval (e.g., every 10 seconds)

```bash
python monitor_local.py --watch 10
```

Adjust the number (5, 10, 30, 60, etc.) for desired update frequency.

### Option 4: Save Output to File

```bash
python monitor_local.py --watch 5 --save monitor.log
```

Displays in terminal **and** saves to `monitor.log`.

View log:
```bash
tail -f monitor.log    # Mac/Linux
type monitor.log       # Windows
Get-Content monitor.log -Tail 20  # PowerShell
```

### Option 5: Reconfigure SSH Settings

```bash
python monitor_local.py --reconfigure
```

Re-runs the setup wizard (use if you need to change server/user/etc).

### Option 6: Test SSH Connection Only

```bash
python monitor_local.py --test
```

Verifies SSH works without running the full monitor.

---

## Example Workflows

### Workflow 1: Quick Check Every Hour (Cron/Task Scheduler)

**Windows Task Scheduler:**

```batch
# Create batch file: measles_check.bat
@echo off
cd C:\Users\YourName\Documents
python monitor_local.py >> measles_monitor.log 2>&1
```

Then schedule in Task Scheduler to run every hour.

**Mac/Linux Cron:**

```bash
# Add to crontab (crontab -e)
*/60 * * * * cd ~/Documents && python monitor_local.py >> measles_monitor.log 2>&1
```

### Workflow 2: Live Dashboard in Terminal

```bash
# Terminal 1: Live monitoring
python monitor_local.py --watch 5

# Terminal 2: View log file in real-time (Mac/Linux)
tail -f monitor.log

# Terminal 2: View log file in PowerShell
Get-Content monitor.log -Tail 10 -Wait
```

### Workflow 3: Background Monitoring with Logging

```bash
# Mac/Linux: Start in background
nohup python monitor_local.py --watch 10 --save monitor.log &

# Windows PowerShell: Start in background
Start-Process python -ArgumentList "monitor_local.py --watch 10 --save monitor.log" -NoNewWindow -RedirectStandardOutput monitor.log

# View anytime
cat monitor.log
```

---

## Configuration File

After first setup, your SSH config is saved to:

**Windows:**
```
C:\Users\YourName\.measles_monitor_config.json
```

**Mac/Linux:**
```
~/.measles_monitor_config.json
```

**Contents:**
```json
{
  "host": "server.com",
  "user": "jsmith",
  "port": 22,
  "key_file": null
}
```

You can edit this file directly to change settings (then run `python monitor_local.py --test` to verify).

---

## Using SSH Key Authentication (Optional)

If your server uses SSH keys instead of passwords:

### Option 1: Interactive Setup

When prompted:
```
SSH Key File (leave blank for password): /Users/jsmith/.ssh/id_rsa
```

### Option 2: Edit Config File

Edit `~/.measles_monitor_config.json`:

```json
{
  "host": "server.com",
  "user": "jsmith",
  "port": 22,
  "key_file": "/Users/jsmith/.ssh/id_rsa"
}
```

### Option 3: SSH Config File

Create/edit `~/.ssh/config`:

```
Host measles-server
  HostName server.com
  User jsmith
  IdentityFile ~/.ssh/id_rsa
  Port 22
```

Then use: `monitor_local.py` with host `measles-server`

---

## Troubleshooting

### "SSH not found"

**Windows:**
- Make sure Git Bash is installed: https://git-scm.com/download/win
- Or use PowerShell (Windows 10+)
- Or install OpenSSH via Windows settings

**Solution:**
```bash
# Test SSH availability
ssh -V
```

Should show: `OpenSSH_7.x` or similar

### "Permission denied" or "Authentication failed"

```bash
# Test your SSH credentials manually
ssh -v user@server.com

# This will show detailed connection info
```

Check:
- Username is correct
- Password is correct
- SSH key permissions (644 for key file)

### "Connection refused" or "Connection timeout"

```bash
# Test server is reachable
ping server.com
ssh -p 22 user@server.com
```

Check:
- Server hostname/IP is correct
- Server is online
- Port 22 is open (some networks block SSH)
- SSH server is running on remote machine

### "No such file or directory" (remote script not found)

```bash
# Verify project path on remote server
ssh user@server "ls -la ~/measles_mexico_manuscript/scripts/monitor_simple.py"
```

If not found:
```bash
python monitor_local.py --reconfigure
```

Update the "Remote Project Path" to correct location.

### Output looks corrupted or has strange characters

This is normal for SSH on some terminals. Try:

**Windows PowerShell:**
```powershell
python monitor_local.py --watch | Out-String
```

**Windows Command Prompt:**
```cmd
python monitor_local.py --watch 2>&1
```

**Mac/Linux:**
```bash
python monitor_local.py --watch | cat
```

### SSH hangs or takes too long

Add timeout (Mac/Linux):
```bash
timeout 10 python monitor_local.py
```

Or Windows:
```powershell
Start-Process python -ArgumentList "monitor_local.py" -NoNewWindow -Wait
```

---

## Advanced: SSH Tunneling

If you need to access through a jump host:

**Edit SSH config (`~/.ssh/config`):**

```
Host measles-server
  HostName internal-server.com
  User jsmith
  ProxyCommand ssh jumphost.com -W %h:%p
  Port 22
```

Then use the monitor as normal - SSH will handle the tunneling.

---

## Real-World Examples

### Example 1: Check Status Every Morning

```bash
# Save as check_measles.sh (Mac/Linux)
#!/bin/bash
python ~/Documents/monitor_local.py > ~/measles_status.txt
cat ~/measles_status.txt
echo "Status saved to measles_status.txt"

# Make executable
chmod +x check_measles.sh

# Run daily (add to crontab)
0 9 * * * ~/check_measles.sh
```

### Example 2: Real-Time Dashboard

```bash
# Terminal window 1: Continuous monitoring
python monitor_local.py --watch 10 --save monitor.log

# Terminal window 2: Watch the log (Mac/Linux)
while true; do clear; tail -20 monitor.log; sleep 5; done

# Terminal window 2: Watch the log (PowerShell)
while (1) { Clear-Host; Get-Content monitor.log -Tail 20; Start-Sleep 5 }
```

### Example 3: Automated Email Alert

```python
import subprocess
import smtplib
from email.mime.text import MIMEText

# Run monitor
result = subprocess.run(['python', 'monitor_local.py'], capture_output=True, text=True)
status = result.stdout

# Check if phase completed
if 'DONE' in status and 'phase2' in status:
    # Send email alert
    msg = MIMEText(f"Phase 2 complete!\n\n{status}")
    msg['Subject'] = 'Measles Project Alert: Phase 2 Done'
    msg['From'] = 'you@example.com'
    msg['To'] = 'you@example.com'
    
    # Send via SMTP (configure for your email)
    ...
```

---

## Performance Tips

- **For slow connections:** Use `--watch 30` or higher (longer intervals)
- **For fast updates:** Use `--watch 2` or `--watch 5`
- **For logging:** Add `--save monitor.log` to keep history
- **For background:** Run with `nohup` (Mac/Linux) or `Start-Process` (Windows)

---

## Summary

| Task | Command |
|------|---------|
| **Initial setup** | `python monitor_local.py` |
| **Live monitoring** | `python monitor_local.py --watch` |
| **Quick check** | `python monitor_local.py` (after setup) |
| **Reconfigure** | `python monitor_local.py --reconfigure` |
| **Test connection** | `python monitor_local.py --test` |
| **Save to log** | `python monitor_local.py --watch --save output.log` |
| **View config** | Edit `~/.measles_monitor_config.json` |

---

## Next Steps

1. **Copy `monitor_local.py` to your local machine**

2. **Run initial setup:**
   ```bash
   python monitor_local.py
   ```

3. **Try live monitoring:**
   ```bash
   python monitor_local.py --watch
   ```

4. **Create aliases for convenience:**
   ```bash
   # Mac/Linux: Add to ~/.bash_profile
   alias measles='python ~/Documents/monitor_local.py --watch'
   
   # Windows PowerShell: Add to $PROFILE
   Set-Alias measles 'python ~/Documents/monitor_local.py --watch'
   ```

Then just use: `measles`

---

**Questions?** The script has built-in help:

```bash
python monitor_local.py --help
```

Good luck monitoring! 🚀

