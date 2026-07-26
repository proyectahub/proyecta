#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream};
use std::process::{Child, Command};
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
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
    shares_accepted: u64,
    shares_rejected: u64,
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

fn format_hashrate(value: f64) -> String {
    if value >= 1_000_000.0 {
        format!("{:.2} MH/s", value / 1_000_000.0)
    } else if value >= 1_000.0 {
        format!("{:.1} kH/s", value / 1_000.0)
    } else {
        format!("{:.0} H/s", value)
    }
}

fn read_xmrig_stats() -> Option<MiningStats> {
    let address: SocketAddr = "127.0.0.1:3002".parse().ok()?;
    let mut stream = TcpStream::connect_timeout(&address, Duration::from_millis(250)).ok()?;
    let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
    let _ = stream.set_write_timeout(Some(Duration::from_millis(500)));
    stream
        .write_all(b"GET /2/summary HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")
        .ok()?;

    let mut response = String::new();
    stream.read_to_string(&mut response).ok()?;
    let body = response.split_once("\r\n\r\n")?.1;
    let summary: serde_json::Value = serde_json::from_str(body).ok()?;

    let hashrate = summary
        .pointer("/hashrate/total/0")
        .and_then(serde_json::Value::as_f64)
        .unwrap_or(0.0);
    let accepted = summary
        .pointer("/results/shares_good")
        .and_then(serde_json::Value::as_u64)
        .unwrap_or(0);
    let total_shares = summary
        .pointer("/results/shares_total")
        .and_then(serde_json::Value::as_u64)
        .unwrap_or(accepted);
    let total_hashes = summary
        .pointer("/results/hashes_total")
        .and_then(serde_json::Value::as_u64)
        .unwrap_or(0);
    let pool_connected = summary
        .pointer("/connection/pool")
        .and_then(serde_json::Value::as_str)
        .is_some_and(|pool| !pool.is_empty());

    Some(MiningStats {
        is_running: true,
        hashrate: format_hashrate(hashrate),
        total_hashes,
        shares_accepted: accepted,
        shares_rejected: total_shares.saturating_sub(accepted),
        pool_connected,
    })
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

    let wallet = wallet.trim().to_string();
    if wallet.is_empty() {
        return Err("Ingresa una direccion Monero antes de iniciar la mineria.".to_string());
    }

    if let Some(mut child) = miner.process.take() {
        let _ = child.kill();
    }

    let mining_config = MiningConfig {
        wallet,
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
    let xmrig_directory = xmrig_path
        .parent()
        .ok_or_else(|| "No se pudo preparar el motor de mineria.".to_string())?;

    let mut command = Command::new(&xmrig_path);
    command.current_dir(xmrig_directory);

    // SupportXMR groups worker statistics by the suffix of the login name.
    let pool_user = format!("{}.{}", mining_config.wallet, mining_config.worker_name);

    let child = command
        .arg("-o")
        .arg(format!("{}:{}", mining_config.pool_url, mining_config.pool_port))
        .arg("-u")
        .arg(pool_user)
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
    let mut miner = config.lock().unwrap();

    let is_running = match miner.process.as_mut() {
        Some(child) => match child.try_wait() {
            Ok(None) => true,
            Ok(Some(_)) | Err(_) => {
                miner.process = None;
                miner.config = None;
                false
            }
        },
        None => false,
    };

    if is_running {
        if let Some(stats) = read_xmrig_stats() {
            return stats;
        }
    }

    MiningStats {
        is_running,
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
