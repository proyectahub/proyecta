# Remote SSH Monitoring Guide

## Overview

Monitor your measles manuscript project in real-time from anywhere via SSH. Watch progress bars, task queues, and phase completion without leaving your terminal.

---

## Quick Start (5 minutes)

### Option 1: Simple One-Time Check

**From any terminal:**
```bash
ssh user@server "cd /path/to/measles_mexico_manuscript && python scripts/monitor_simple.py"
```

### Option 2: Live Updates Every 5 Seconds

**From any terminal:**
```bash
ssh user@server "cd /path/to/measles_mexico_manuscript && python scripts/monitor_simple.py --watch"
```

### Option 3: Custom Update Interval (e.g., every 10 seconds)

```bash
ssh user@server "cd /path/to/measles_mexico_manuscript && python scripts/monitor_simple.py --watch 10"
```

---

## Monitor Features

The monitor displays:

### 1. **Phase Overview**
Shows status of all 6 project phases with progress bars:
- Phase 1: MSA & Conservation Analysis
- Phase 2: Conservation-Guided Docking
- Phase 3: Molecular Dynamics Simulations
- Phase 4: Antiviral Screening & Ranking
- Phase 5: ADMET & Drug-likeness Prediction
- Phase 6: Manuscript Assembly & Publication

### 2. **Active Tasks**
Detailed breakdown of tasks currently running or completed with:
- Task name and description
- Progress percentage
- Time elapsed / ETA

### 3. **Generated Files**
Status of all output files:
- Figure 3 composite and individual panels
- Publication guides and summaries
- File sizes and modification times

### 4. **Task Queue Summary**
Overall project metrics:
- Completed tasks: X/Y
- In-progress tasks: X/Y
- Pending tasks: X/Y
- Overall completion: %

---

## Usage Examples

### Example 1: Quick Status Check

```bash
$ ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py"
```

Output: Single status display, then exits.

**Best for:** Quick check-ins, cron jobs, scripting

### Example 2: Live Monitoring (30-second intervals)

```bash
$ ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py --watch 30"
```

Output: Updates display every 30 seconds until you press Ctrl+C.

**Best for:** Watching long-running tasks, real-time dashboards

### Example 3: Local Terminal with Colors (using tmux)

```bash
# In your local terminal, start a persistent session
$ tmux new-session -d -s measles-monitor
$ tmux send-keys -t measles-monitor "ssh user@server 'cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py --watch'" Enter

# View the session anytime
$ tmux attach -t measles-monitor

# Detach (Ctrl+B, then D)
```

### Example 4: Headless Monitoring (script mode)

```bash
#!/bin/bash
# save as monitor.sh

USER="youruser"
SERVER="yourserver.com"
INTERVAL=300  # 5 minutes

while true; do
    clear
    echo "Measles Manuscript Monitor - $(date)"
    echo "========================================"
    ssh $USER@$SERVER "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py"
    echo ""
    echo "Next update in $INTERVAL seconds..."
    sleep $INTERVAL
done
```

Run with: `bash monitor.sh`

---

## Server Setup (One-time)

### 1. Install Dependencies

```bash
# On remote server, in project directory
cd ~/measles_mexico_manuscript

# Ensure Python 3.7+ installed
python3 --version

# No additional packages needed - monitor uses only standard library
```

### 2. Configure SSH Key (Optional, recommended)

For passwordless SSH:

```bash
# Generate key (if you don't have one)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# Copy to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# Test
ssh user@server "echo 'Success!'"
```

### 3. Create Alias (Optional, for convenience)

```bash
# Add to ~/.bash_profile or ~/.bashrc
alias measles-monitor='ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py"'
alias measles-watch='ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py --watch"'

# Now use
$ measles-monitor          # One-time check
$ measles-watch            # Live monitoring
```

---

## Monitor Data Structure

The monitor reads project state from:

```
measles_mexico_manuscript/
├── scripts/
│   └── monitor_simple.py          # Main monitor script
├── figures/                        # Generated PNG files
│   ├── figure3_enhanced_composite.png
│   ├── figure3_panel_A_professional.png
│   ├── figure3_panel_B_conservation_bars.png
│   └── figure3_panel_C_box_comparison.png
├── results/                        # Analysis outputs
│   ├── alignment.fasta
│   └── conservation_scores.csv
└── .monitor_status.json            # Monitor state (auto-updated)
```

The monitor scans these directories and reports:
- File existence and size
- Modification timestamps
- Task completion status

---

## Real-Time Customization

### Add New Task to Monitor

Edit `scripts/monitor_simple.py`, locate the `PHASES` dictionary:

```python
'phase2': {
    'name': 'Conservation-Guided Docking',
    'status': 'in_progress',
    'progress': 65.0,
    'tasks': {
        'grid': 'Docking Grid Design',
        'docking1': 'First-Pass Docking',
        'docking2': 'Refined Docking',
        'analysis': 'Results Analysis',  # Add new task here
    }
},
```

### Change Update Interval

```bash
# Every 2 seconds (for very active monitoring)
python scripts/monitor_simple.py --watch 2

# Every 60 seconds (for slow updates)
python scripts/monitor_simple.py --watch 60

# Every 10 minutes (for background tracking)
nohup python scripts/monitor_simple.py --watch 600 > monitor.log 2>&1 &
```

---

## Production Monitoring

### Option A: Persistent Background Monitor

```bash
# Start background monitor that logs to file
nohup ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py --watch 300" > measles_monitor.log 2>&1 &

# View log
tail -f measles_monitor.log

# Stop monitoring
pkill -f "monitor_simple.py"
```

### Option B: Cron Job Monitoring

```bash
# Add to crontab (every 30 minutes)
*/30 * * * * ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py" >> ~/measles_monitor.log 2>&1
```

Check logs: `cat ~/measles_monitor.log`

### Option C: CI/CD Integration

For GitHub Actions or GitLab CI:

```yaml
# .github/workflows/monitor.yml
name: Monitor Project
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check Project Status
        run: |
          ssh-keyscan ${{ secrets.SERVER }} >> ~/.ssh/known_hosts
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SERVER }} \
            "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py"
```

---

## Troubleshooting

### Q: "Permission denied" when running monitor

```bash
# Ensure you have read access to project directory
ssh user@server "ls -la ~/measles_mexico_manuscript"

# If permission issues, adjust
ssh user@server "chmod -R u+rx ~/measles_mexico_manuscript"
```

### Q: Monitor output shows outdated information

```bash
# The monitor reads file timestamps
# If tasks run asynchronously, update manually
ssh user@server "touch ~/measles_mexico_manuscript/figures/figure3_enhanced_composite.png"
```

### Q: SSH connection hangs with --watch

```bash
# Use timeout
timeout 600 ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py --watch"

# Or use SSH timeout option
ssh -o ConnectTimeout=10 -o ServerAliveInterval=60 user@server "..."
```

### Q: Need to see output AND save to file

```bash
# Use tee to both display and log
ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py" | tee -a monitor.log
```

---

## Display Interpretation

### Phase Status Indicators

```
[DONE]     - Phase completed (all tasks finished)
[RUNNING]  - Phase in progress (some tasks active)
[PENDING]  - Phase waiting to start (no tasks started)
```

### Progress Bars

```
[====================----] 100.0%    - Completed
[==============--------]  65.0%    - In progress
[------------------------]   0.0%    - Pending
```

### Task Queue Summary

```
Completed:   3/19 tasks (15.8%)
In Progress: 7/19 tasks (36.8%)
Pending:     9/19 tasks (47.4%)
Overall:     15.8% complete
```

---

## Advanced: HTTP API Server

For web-based dashboards (optional):

```bash
# Start HTTP API server
ssh user@server "cd ~/measles_measles_mexico_manuscript && python scripts/monitor_remote.py --server"

# Access API
curl http://server:8888/api/status | jq .

# Or via SSH tunnel
ssh -L 8888:localhost:8888 user@server &
curl http://localhost:8888/api/status | jq .
```

Returns JSON with full project state:

```json
{
  "timestamp": 1717959648.5,
  "overall_progress": 15.8,
  "phases": {
    "phase1": {
      "progress": 95.0,
      "status": "completed",
      "tasks": "3/3"
    },
    "phase2": {
      "progress": 65.0,
      "status": "in_progress",
      "tasks": "2/4"
    }
  }
}
```

---

## Summary

| Method | Command | Best For |
|--------|---------|----------|
| **One-time** | `monitor_simple.py` | Quick checks |
| **Live (5s)** | `--watch` | Active monitoring |
| **Live (custom)** | `--watch 30` | Specific intervals |
| **Persistent** | `nohup ... &` | Background tracking |
| **Scheduled** | `cron` or CI/CD | Regular reports |
| **Web API** | `--server` | Dashboards/integration |

---

## Getting Help

```bash
# Show all options
python scripts/monitor_simple.py --help

# Check monitor is executable
ls -l scripts/monitor_simple.py

# Test connectivity
ssh user@server "echo 'Connected!'"

# View project structure
ssh user@server "find ~/measles_mexico_manuscript -type f -name '*.png' | head -10"
```

---

**Ready to monitor?** Start with:

```bash
ssh user@server "cd ~/measles_mexico_manuscript && python scripts/monitor_simple.py --watch"
```

Press Ctrl+C anytime to stop.

