#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};

#[derive(Serialize, Deserialize, Clone)]
struct MiningConfig {
    wallet: String,
    pool_url: String,
    pool_port: u16,
    worker_name: String,
    threads: u32,
    cpu_percent: u32,
}

#[derive(Serialize, Deserialize, Clone)]
struct MiningStats {
    is_running: bool,
    hashrate: String,
    total_hashes: u64,
    shares_accepted: u32,
    shares_rejected: u32,
    pool_connected: bool,
}

struct MinerState {
    process: Option<Child>,
    config: Option<MiningConfig>,
}

fn normalize_worker_name(input: &str) -> String {
    let mut cleaned: String = input
        .trim()
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() || ch == '.' || ch == '_' || ch == '-' { ch } else { '-' })
        .collect();

    while cleaned.contains("--") {
        cleaned = cleaned.replace("--", "-");
    }

    cleaned = cleaned.trim_matches(|ch| ch == '-' || ch == '_' || ch == '.').to_string();
    cleaned.truncate(32);

    if cleaned.is_empty() {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or(0);
        format!("proyecta-{nanos:x}")
    } else {
        cleaned
    }
}

#[tauri::command]
fn start_mining(
    wallet: String,
    threads: u32,
    worker_name: String,
    app: AppHandle,
    config: State<Mutex<MinerState>>,
) -> Result<String, String> {
    let mut miner = config.lock().unwrap();

    if let Some(mut child) = miner.process.take() {
        let _ = child.kill();
    }

    let mining_config = MiningConfig {
        wallet: wallet.clone(),
        pool_url: "pool.supportxmr.com".to_string(),
        pool_port: 3333,
        worker_name: normalize_worker_name(&worker_name),
        threads,
        cpu_percent: 100,
    };

    let xmrig_path = app
        .path_resolver()
        .resolve_resource("binaries/xmrig.exe")
        .ok_or_else(|| "El motor de mineria no esta disponible en esta instalacion.".to_string())?;

    let child = Command::new(&xmrig_path)
        .arg("-o")
        .arg(format!("{}:{}", mining_config.pool_url, mining_config.pool_port))
        .arg("-u")
        .arg(wallet.clone())
        .arg("-p")
        .arg(&mining_config.worker_name)
        .arg("--rig-id")
        .arg(&mining_config.worker_name)
        .arg("-r")
        .arg("10")
        .arg("--algo")
        .arg("rx/0")
        .arg("--cpu-affinity")
        .arg("-1")
        .arg("--threads")
        .arg(threads.to_string())
        .arg("--http-port")
        .arg("3002")
        .spawn()
        .map_err(|_| "No se pudo iniciar el motor de mineria. Reinstala la aplicacion e intentalo de nuevo.".to_string())?;

    miner.process = Some(child);
    miner.config = Some(mining_config);

    Ok("Minería iniciada".to_string())
}

#[tauri::command]
fn stop_mining(config: State<Mutex<MinerState>>) -> Result<String, String> {
    let mut miner = config.lock().unwrap();

    if let Some(mut child) = miner.process.take() {
        child.kill().map_err(|e| format!("Error al detener: {e}"))?;
    }

    miner.config = None;
    Ok("Minería detenida".to_string())
}

#[tauri::command]
fn get_mining_status(config: State<Mutex<MinerState>>) -> MiningStats {
    let miner = config.lock().unwrap();

    MiningStats {
        is_running: miner.process.is_some(),
        hashrate: "0 H/s".to_string(),
        total_hashes: 0,
        shares_accepted: 0,
        shares_rejected: 0,
        pool_connected: false,
    }
}

#[tauri::command]
fn get_system_info() -> String {
    format!("CPUs: {}", std::thread::available_parallelism().map(|n| n.get()).unwrap_or(1))
}

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(MinerState {
            process: None,
            config: None,
        }))
        .invoke_handler(tauri::generate_handler![
            start_mining,
            stop_mining,
            get_mining_status,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
