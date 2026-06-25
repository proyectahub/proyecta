# ============================================================
#  PROYECTA Miner — App con interfaz grafica
#  Mineria RandomX (xmrig oficial) para financiar la ciencia.
#  - Campo editable para la direccion Monero del proyecto
#  - Selector de pool (menor fee / pago minimo bajo)
#  - Hashrate y shares en vivo
# ============================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

# ---------- Configuracion ----------
$DefaultWallet = "42gfB3ayxZV2VNH8KAsUMU5fcXUqd83BGJneR37KqJaBQuzYJ8w5d3aV5DBkFH2oWo9YzJLcjhv2d5dR4V2C2xFrUGKiePh"
$HttpPort = 48000

$Pools = [ordered]@{
    "SupportXMR  -  fee 0.6% (recomendado)" = "pool.supportxmr.com:3333"
    "HeroMiners  -  pago minimo muy bajo"   = "monero.herominers.com:1111"
    "Nanopool"                              = "xmr-eu1.nanopool.org:14444"
}

# ---------- Rutas (robusto: .ps1 y .exe) ----------
if ($MyInvocation.MyCommand.Path) {
    $Root = Split-Path -Parent $MyInvocation.MyCommand.Path
} elseif ($PSScriptRoot) {
    $Root = $PSScriptRoot
} else {
    $Root = [System.IO.Path]::GetDirectoryName([System.Diagnostics.Process]::GetCurrentProcess().MainModule.FileName)
}
$BinDir = Join-Path $Root "xmrig"
$Exe    = Join-Path $BinDir "xmrig.exe"

# ---------- Colores PROYECTA ----------
$cPurple = [System.Drawing.Color]::FromArgb(124,58,237)
$cMagenta= [System.Drawing.Color]::FromArgb(192,38,211)
$cDark   = [System.Drawing.Color]::FromArgb(15,23,42)
$cBg     = [System.Drawing.Color]::FromArgb(248,250,252)
$cWhite  = [System.Drawing.Color]::White
$cGreen  = [System.Drawing.Color]::FromArgb(16,185,129)
$cGray   = [System.Drawing.Color]::FromArgb(100,116,139)

$script:proc = $null

# ---------- Ventana ----------
$form = New-Object System.Windows.Forms.Form
$form.Text = "PROYECTA Miner"
$form.Size = New-Object System.Drawing.Size(470, 640)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.BackColor = $cBg
try { $form.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon([System.Diagnostics.Process]::GetCurrentProcess().MainModule.FileName) } catch {}

# ---------- Header con gradiente ----------
$header = New-Object System.Windows.Forms.Panel
$header.Size = New-Object System.Drawing.Size(470, 96)
$header.Location = New-Object System.Drawing.Point(0,0)
$header.Add_Paint({
    param($s,$e)
    $r = New-Object System.Drawing.Rectangle 0,0,$s.Width,$s.Height
    $b = New-Object System.Drawing.Drawing2D.LinearGradientBrush $r, $cPurple, $cMagenta, 0
    $e.Graphics.FillRectangle($b, $r)
    $e.Graphics.TextRenderingHint = 'AntiAliasGridFit'
    $f1 = New-Object System.Drawing.Font 'Segoe UI', 26, ([System.Drawing.FontStyle]::Bold)
    $f2 = New-Object System.Drawing.Font 'Segoe UI', 9.5
    $wb = New-Object System.Drawing.SolidBrush $cWhite
    $e.Graphics.DrawString("PROYECTA", $f1, $wb, 18, 18)
    $e.Graphics.DrawString("Mineria para financiar la ciencia", $f2, $wb, 22, 62)
})
$form.Controls.Add($header)

# ---------- Helper de labels ----------
function New-Label($text, $x, $y, $w, $size, $color, $bold) {
    $l = New-Object System.Windows.Forms.Label
    $l.Text = $text
    $l.Location = New-Object System.Drawing.Point($x,$y)
    $l.Size = New-Object System.Drawing.Size($w, 22)
    $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
    $l.Font = New-Object System.Drawing.Font 'Segoe UI', $size, $style
    $l.ForeColor = $color
    $l.BackColor = [System.Drawing.Color]::Transparent
    return $l
}

# ---------- Direccion del proyecto ----------
$form.Controls.Add( (New-Label "Direccion Monero del proyecto" 20 112 420 9.5 $cDark $true) )
$txtWallet = New-Object System.Windows.Forms.TextBox
$txtWallet.Location = New-Object System.Drawing.Point(20, 136)
$txtWallet.Size = New-Object System.Drawing.Size(420, 26)
$txtWallet.Font = New-Object System.Drawing.Font 'Consolas', 8.5
$txtWallet.Text = $DefaultWallet
$form.Controls.Add($txtWallet)

# ---------- Pool ----------
$form.Controls.Add( (New-Label "Pool de mineria" 20 174 420 9.5 $cDark $true) )
$cmbPool = New-Object System.Windows.Forms.ComboBox
$cmbPool.Location = New-Object System.Drawing.Point(20, 198)
$cmbPool.Size = New-Object System.Drawing.Size(420, 26)
$cmbPool.DropDownStyle = "DropDownList"
$cmbPool.Font = New-Object System.Drawing.Font 'Segoe UI', 9.5
foreach ($k in $Pools.Keys) { [void]$cmbPool.Items.Add($k) }
$cmbPool.SelectedIndex = 0
$form.Controls.Add($cmbPool)

# ---------- Hilos ----------
$cores = [Environment]::ProcessorCount
$form.Controls.Add( (New-Label "Hilos de CPU (de $cores disponibles)" 20 236 420 9.5 $cDark $true) )
$numThreads = New-Object System.Windows.Forms.NumericUpDown
$numThreads.Location = New-Object System.Drawing.Point(20, 260)
$numThreads.Size = New-Object System.Drawing.Size(80, 26)
$numThreads.Font = New-Object System.Drawing.Font 'Segoe UI', 11
$numThreads.Minimum = 1
$numThreads.Maximum = $cores
$numThreads.Value = [Math]::Max(1, [Math]::Floor($cores/2))
$form.Controls.Add($numThreads)
$form.Controls.Add( (New-Label "Mas hilos = mas rapido pero mas calor/consumo" 110 264 330 8.5 $cGray $false) )

# ---------- Panel de stats ----------
$panel = New-Object System.Windows.Forms.Panel
$panel.Location = New-Object System.Drawing.Point(20, 300)
$panel.Size = New-Object System.Drawing.Size(420, 130)
$panel.BackColor = $cWhite
$panel.BorderStyle = "FixedSingle"
$form.Controls.Add($panel)

$panel.Controls.Add( (New-Label "HASHRATE" 16 14 180 8 $cGray $true) )
$lblHash = New-Label "0 H/s" 16 30 200 22 $cPurple $true
$lblHash.Font = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Bold)
$lblHash.Size = New-Object System.Drawing.Size(220, 40)
$panel.Controls.Add($lblHash)

$panel.Controls.Add( (New-Label "SHARES ACEPTADOS" 250 14 160 8 $cGray $true) )
$lblShares = New-Label "0" 250 30 160 22 $cGreen $true
$lblShares.Font = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Bold)
$lblShares.Size = New-Object System.Drawing.Size(160, 40)
$panel.Controls.Add($lblShares)

$lblStatus = New-Label "Listo para minar." 16 88 390 9.5 $cGray $false
$lblStatus.Size = New-Object System.Drawing.Size(390, 30)
$panel.Controls.Add($lblStatus)

# ---------- Boton iniciar/detener ----------
$btn = New-Object System.Windows.Forms.Button
$btn.Location = New-Object System.Drawing.Point(20, 446)
$btn.Size = New-Object System.Drawing.Size(420, 50)
$btn.Text = "Iniciar mineria"
$btn.Font = New-Object System.Drawing.Font 'Segoe UI', 13, ([System.Drawing.FontStyle]::Bold)
$btn.ForeColor = $cWhite
$btn.BackColor = $cGreen
$btn.FlatStyle = "Flat"
$btn.FlatAppearance.BorderSize = 0
$form.Controls.Add($btn)

# ---------- Footer ----------
$lblFoot = New-Label "Los XMR van directo a la direccion del proyecto. Verifica en supportxmr.com" 20 508 420 8 $cGray $false
$lblFoot.Size = New-Object System.Drawing.Size(420, 40)
$form.Controls.Add($lblFoot)

# ---------- Timer de stats ----------
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1500
$timer.Add_Tick({
    if (-not $script:proc -or $script:proc.HasExited) { return }
    try {
        $sum = Invoke-RestMethod -Uri "http://127.0.0.1:$HttpPort/2/summary" -TimeoutSec 2
        $hr = 0
        if ($sum.hashrate.total -and $sum.hashrate.total[0]) { $hr = [math]::Round($sum.hashrate.total[0],1) }
        $lblHash.Text = "$hr H/s"
        $lblShares.Text = "$($sum.results.shares_good)"
        if ($hr -gt 0) { $lblStatus.Text = "Minando RandomX a plena potencia." }
        else { $lblStatus.Text = "Inicializando dataset RandomX (2GB)... espera ~1 min." }
    } catch {
        $lblStatus.Text = "Iniciando minero / cargando dataset..."
    }
})

# ---------- Descargar xmrig si falta ----------
function Ensure-Xmrig {
    if (Test-Path $Exe) { return $true }
    $lblStatus.Text = "Descargando xmrig oficial (~3 MB)..."
    [System.Windows.Forms.Application]::DoEvents()
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $headers = @{ "User-Agent" = "proyecta-miner" }
        $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/xmrig/xmrig/releases/latest" -Headers $headers
        $asset = $rel.assets | Where-Object { $_.name -like "*windows-x64.zip" } | Select-Object -First 1
        if (-not $asset) { $asset = $rel.assets | Where-Object { $_.name -like "*windows-gcc-x64.zip" } | Select-Object -First 1 }
        $zip = Join-Path $Root $asset.name
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -Headers $headers
        $lblStatus.Text = "Extrayendo xmrig..."
        [System.Windows.Forms.Application]::DoEvents()
        $tmp = Join-Path $Root "_xmrig_tmp"
        if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
        Expand-Archive -Path $zip -DestinationPath $tmp -Force
        if (Test-Path $BinDir) { Remove-Item $BinDir -Recurse -Force }
        New-Item -ItemType Directory -Path $BinDir | Out-Null
        $inner = Get-ChildItem $tmp -Directory | Select-Object -First 1
        Copy-Item (Join-Path $inner.FullName "*") $BinDir -Recurse -Force
        Remove-Item $zip -Force; Remove-Item $tmp -Recurse -Force
        return $true
    } catch {
        [System.Windows.Forms.MessageBox]::Show("No se pudo descargar xmrig.`n$($_.Exception.Message)`n`nDescargalo manualmente de github.com/xmrig/xmrig/releases y pon xmrig.exe en la carpeta xmrig\.", "PROYECTA Miner", "OK", "Error") | Out-Null
        return $false
    }
}

function Start-Mining {
    $wallet = $txtWallet.Text.Trim()
    if ($wallet -notmatch '^[48][0-9A-Za-z]{94}$') {
        [System.Windows.Forms.MessageBox]::Show("La direccion Monero no parece valida (debe empezar con 4 y tener 95 caracteres).", "PROYECTA Miner", "OK", "Warning") | Out-Null
        return
    }
    if (-not (Ensure-Xmrig)) { return }

    # Matar cualquier xmrig previo
    Get-Process xmrig -ErrorAction SilentlyContinue | Stop-Process -Force

    $poolName = $cmbPool.SelectedItem
    $pool = $Pools[$poolName]
    $threads = [int]$numThreads.Value

    $args = @(
        "-o", $pool, "-u", $wallet, "-p", "proyecta",
        "--rig-id", "proyecta-gui", "-a", "rx/0", "-k",
        "--donate-level", "1",
        "--http-host", "127.0.0.1", "--http-port", "$HttpPort",
        "--threads", "$threads"
    )

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $Exe
    $psi.Arguments = ($args -join ' ')
    $psi.WorkingDirectory = $BinDir
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.WindowStyle = "Hidden"
    $script:proc = [System.Diagnostics.Process]::Start($psi)

    $timer.Start()
    $btn.Text = "Detener mineria"
    $btn.BackColor = [System.Drawing.Color]::FromArgb(220,38,38)
    $txtWallet.Enabled = $false; $cmbPool.Enabled = $false; $numThreads.Enabled = $false
    $lblStatus.Text = "Iniciando minero en $poolName..."
}

function Stop-Mining {
    $timer.Stop()
    if ($script:proc -and -not $script:proc.HasExited) { try { $script:proc.Kill() } catch {} }
    Get-Process xmrig -ErrorAction SilentlyContinue | Stop-Process -Force
    $script:proc = $null
    $btn.Text = "Iniciar mineria"
    $btn.BackColor = $cGreen
    $txtWallet.Enabled = $true; $cmbPool.Enabled = $true; $numThreads.Enabled = $true
    $lblHash.Text = "0 H/s"; $lblShares.Text = "0"
    $lblStatus.Text = "Detenido."
}

$btn.Add_Click({
    if ($script:proc -and -not $script:proc.HasExited) { Stop-Mining } else { Start-Mining }
})

$form.Add_FormClosing({
    if ($script:proc -and -not $script:proc.HasExited) { try { $script:proc.Kill() } catch {} }
    Get-Process xmrig -ErrorAction SilentlyContinue | Stop-Process -Force
})

[void]$form.ShowDialog()
