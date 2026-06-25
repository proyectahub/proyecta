# PROYECTA — Minero de Alto Rendimiento ⛏️

Mina Monero (XMR) **de verdad** para financiar la ciencia, usando **xmrig nativo**
(el mismo minero profesional que usan los mineros reales). 100–1000x más rápido
que minar en el navegador, porque usa **AES por hardware, JIT y huge pages** —
cosas que un navegador no puede tocar.

> Los XMR van **directo** a la dirección del proyecto. PROYECTA nunca toca los fondos.

---

## 🚀 Cómo usar (sin instalar nada)

### Windows
1. Descarga esta carpeta.
2. **Doble clic en `INICIAR-MINERIA.bat`**.
3. La primera vez descarga xmrig oficial (~3 MB) automáticamente y empieza a minar.

> Si Windows muestra un aviso de SmartScreen: *Más información → Ejecutar de todas formas*
> (es xmrig oficial, descargado de su GitHub).

### Linux / macOS
```bash
chmod +x iniciar-mineria.sh
./iniciar-mineria.sh
```

---

## 📊 Ver tus resultados

Abre **https://supportxmr.com** y pega la dirección del proyecto para ver
hashrate, shares y XMR acumulado en tiempo real.

---

## ⚙️ ¿Qué hace exactamente?

| Paso | Acción |
|---|---|
| 1 | Detecta tu sistema operativo |
| 2 | Descarga el binario **oficial** de xmrig desde su GitHub (una sola vez) |
| 3 | Lo configura apuntando al pool y wallet del proyecto |
| 4 | Empieza a minar RandomX (rx/0) — el algoritmo real de Monero |

No hay nada que compilar. No hay instalador. No toca el registro de Windows.
Para detener: cierra la ventana o `Ctrl+C`.

---

## 🔧 Personalizar

Edita las primeras líneas de `proyecta-miner.ps1` (Windows) o
`iniciar-mineria.sh` (Linux/Mac):

```
Wallet   = "..."      # dirección Monero que recibe el XMR
Pool     = "pool.supportxmr.com:3333"
WorkerId = "proyecta-desktop"
```

Para usar menos CPU, añade `--threads N` (ej. la mitad de tus hilos) al final
del comando de xmrig.

---

## ❓ Preguntas frecuentes

**¿Es seguro?** Sí. Es el xmrig oficial (open source, auditado), descargado
directo de https://github.com/xmrig/xmrig/releases.

**¿Mi antivirus lo marca?** Algunos antivirus marcan *cualquier* minero por
precaución (no porque sea malware). Es un falso positivo conocido de xmrig.

**¿Cuánto gano?** Depende de tu CPU. Un i7 moderno hace ~2000–4000 H/s. Todo
va al proyecto que elijas apoyar.
