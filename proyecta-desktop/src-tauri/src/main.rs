#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::{Manager, State};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
struct MiningConfig {
    wallet: String,
    pool_url: String,
    pool_port: u16,
    rigid: String,
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

// ── API Commands para la UI

#[tauri::command]
fn start_mining(
    wallet: String,
    threads: u32,
    config: State<Mutex<MinerState>>,
) -> Result<String, String> {
    let mut miner = config.lock().unwrap();

    // Detener si ya está corriendo
    if let Some(mut child) = miner.process.take() {
        let _ = child.kill();
    }

    // Configuración del minero
    let mining_config = MiningConfig {
        wallet: wallet.clone(),
        pool_url: "pool.supportxmr.com".to_string(),
        pool_port: 3333,
        rigid: "PROYECTA".to_string(),
        threads,
        cpu_percent: 100,
    };

    // Lanzar xmrig con la config
    // Nota: asumimos que xmrig está en el mismo directorio que la app,
    // o disponible en PATH. En distribución, lo empaquetamos dentro.
    let xmrig_path = if cfg!(windows) {
        "xmrig.exe"
    } else {
        "./xmrig"
    };

    let child = Command::new(xmrig_path)
        .arg("-o")
        .arg(format!("{}:{}", mining_config.pool_url, mining_config.pool_port))
        .arg("-u")
        .arg(wallet.clone())
        .arg("-p")
        .arg("proyecta")
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
        .map_err(|e| format!("No se pudo lanzar xmrig: {}", e))?;

    miner.process = Some(child);
    miner.config = Some(mining_config);

    Ok("Minería iniciada".to_string())
}

#[tauri::command]
fn stop_mining(config: State<Mutex<MinerState>>) -> Result<String, String> {
    let mut miner = config.lock().unwrap();

    if let Some(mut child) = miner.process.take() {
        child.kill().map_err(|e| format!("Error al detener: {}", e))?;
    }

    miner.config = None;

    Ok("Minería detenida".to_string())
}

#[tauri::command]
fn get_mining_status(config: State<Mutex<MinerState>>) -> MiningStats {
    let miner = config.lock().unwrap();

    MiningStats {
        is_running: miner.process.is_some(),
        hashrate: "0 H/s".to_string(), // En producción: leer de xmrig HTTP API
        total_hashes: 0,
        shares_accepted: 0,
        shares_rejected: 0,
        pool_connected: false,
    }
}

#[tauri::command]
fn get_system_info() -> String {
    format!(
        "CPUs: {}",
        num_cpus::get()
    )
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
