# MDatos.ai backend bootstrap

This backend folder now contains two operational foundations:

- `db/`: PostgreSQL schema for customers, credits, experiments, jobs, leases, and secure artifacts.
- `app/`: provider integration and sourcing logic for Vast.ai.

## Vast.ai integration

The Vast.ai adapter is designed to keep the API key outside the codebase.

### Files

- `app/config.py`: loads `VAST_AI_API_KEY` and runtime settings from environment variables.
- `app/integrations/vast_ai.py`: low-level API client for searching offers, creating instances, listing instances, showing instance details, and destroying instances.
- `app/services/compute_allocator.py`: margin-aware offer search and selection logic based on tier plus experiment kind.
- `app/main.py`: FastAPI app that exposes live compute options for the web frontend.
- `scripts/vast_ai_cli.py`: CLI wrapper for operations and manual validation.

## Local backend API

Install the API dependencies:

```powershell
python -m pip install -r requirements.txt
```

Run the backend locally:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Smoke test the API:

```powershell
Invoke-WebRequest "http://127.0.0.1:8000/health" | Select-Object -ExpandProperty Content
Invoke-WebRequest "http://127.0.0.1:8000/api/compute-options?tier=bronze&kind=docking" | Select-Object -ExpandProperty Content
```

### Endpoint for the web UI

`GET /api/compute-options`

Accepted query parameters:

- `tier`: `bronze`, `silver`, `gold`
- `kind`: `docking`, `molecular_dynamics`, `hybrid`
- `min_cpu_cores`
- `min_ram_gb`
- `min_vram_gb`
- `gpu_count`
- `max_hourly_usd`
- `region`

The response already comes sorted and grouped as:

- `routes`: primary, immediate backup, and economic fallback
- `offers`: full compatible live catalog for the current filters

### PowerShell setup

```powershell
$env:VAST_AI_API_KEY="your-secret-here"
```

### Optional local .env (recommended for dev)

Create a local `backend/.env` (do not commit it) with:

```env
VAST_AI_API_KEY=replace-with-your-secret
MDATOS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

### Search for candidate offers

```powershell
python scripts/vast_ai_cli.py search --tier bronze --limit 10
python scripts/vast_ai_cli.py search --tier bronze --kind docking --limit 10
python scripts/vast_ai_cli.py search --tier silver --kind molecular_dynamics --limit 10
python scripts/vast_ai_cli.py search --tier gold --kind hybrid --limit 10
```

### Resource strategy

- `docking`: prioritizes CPU cores per dollar and treats the GPU as an access requirement from Vast.ai rather than the main accelerator.
- `molecular_dynamics`: prioritizes GPU memory, balanced system RAM, and GPU-oriented ranking.
- `hybrid`: keeps a balanced profile between both modes.
- Default disk is `32 GB` because that is the operational minimum you requested; pass a higher `--disk-gb` for long MD trajectories or larger artifact bundles.

### Create an instance

```powershell
python scripts/vast_ai_cli.py create `
  --ask-id 12345678 `
  --image ghcr.io/mdatos/gromacs-vina:latest `
  --label exp-mdatos-001 `
  --disk-gb 32 `
  --runtype ssh_direct `
  --env MDATOS_EXPERIMENT_ID=exp-mdatos-001 `
  --publish 8080:8080 `
  --onstart "bash /workspace/bootstrap/run_pipeline.sh"
```

### Search and create in one step

Use this when you do not want the `ask_id` to expire between `search` and `create`.

```powershell
python scripts/vast_ai_cli.py launch `
  --tier bronze `
  --kind docking `
  --image ubuntu:22.04 `
  --label mdatos-bronze-smoke `
  --disk-gb 32 `
  --runtype ssh_direct
```

### Inspect or destroy an instance

```powershell
python scripts/vast_ai_cli.py list
python scripts/vast_ai_cli.py show --instance-id 1234568
python scripts/vast_ai_cli.py destroy --instance-id 1234568 --confirm-destroy
```

## Recommended next engineering step

With the live sourcing endpoint in place, the next engineering step is the transaction-safe launch service that:

1. Confirms payment or available credits.
2. Reserves credits in Postgres.
3. Calls `GET /api/compute-options` or the internal allocator to source the best acceptable offer.
4. Creates the instance with the MDatos pipeline container.
5. Persists the returned contract id in `provider_leases` and `compute_jobs`.
6. Polls for `running`, uploads results, and destroys the instance once artifacts are secure.
