import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const framesDir = join(root, '.tmp-proyecta-motion-frames');
const output = join(root, 'public', 'page-assets', 'banners', 'proyecta-community-motion.mp4');
const publicOutput = join(root, 'public', 'proyecta-community-motion.mp4');

const width = 960;
const height = 540;
const viewWidth = 1280;
const viewHeight = 720;
const fps = 12;
const seconds = 8;
const totalFrames = fps * seconds;

mkdirSync(framesDir, { recursive: true });
rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });

function wave(frame, offset = 0, amp = 1) {
  return Math.sin((frame / totalFrames) * Math.PI * 2 + offset) * amp;
}

function computerNode(x, y, r, label, frame, delay) {
  const pulse = 1 + Math.max(0, wave(frame, delay, 0.08));
  return `
    <g transform="translate(${x} ${y}) scale(${pulse})">
      <circle r="${r + 13}" fill="#F8E3FF" opacity="0.13"/>
      <circle r="${r}" fill="#FFF7FB" stroke="#F5D7FF" stroke-width="3"/>
      <path d="M-${r * 0.42} ${r * 0.14}h${r * 0.84}v${r * 0.34}h-${r * 0.84}z" fill="#C026D3"/>
      <path d="M-${r * 0.34} ${-r * 0.18}h${r * 0.68}v${r * 0.34}h-${r * 0.68}z" fill="#21131F"/>
      <text y="${r + 34}" text-anchor="middle" font-family="Manrope, Arial" font-size="18" font-weight="800" fill="#FFF7FB">${label}</text>
    </g>`;
}

function stepCard(x, y, n, title, copy) {
  return `
    <g transform="translate(${x} ${y})">
      <rect width="300" height="94" rx="22" fill="#FFF7FB" opacity="0.12" stroke="#F5D7FF" stroke-opacity="0.22"/>
      <circle cx="38" cy="47" r="22" fill="#FFF7FB" opacity="0.94"/>
      <text x="38" y="55" text-anchor="middle" font-family="Sora, Manrope, Arial" font-size="20" font-weight="900" fill="#C026D3">${n}</text>
      <text x="74" y="38" font-family="Sora, Manrope, Arial" font-size="18" font-weight="900" fill="#FFF7FB">${title}</text>
      <text x="74" y="64" font-family="Manrope, Arial" font-size="14" font-weight="700" fill="#F5D7FF">${copy}</text>
    </g>`;
}

function researchProject(frame) {
  const y = 410 + wave(frame, 0.3, 7);
  const line = 92 + wave(frame, 1.1, 14);
  return `
    <g transform="translate(585 ${y})">
      <ellipse cx="64" cy="164" rx="228" ry="28" fill="#21131F" opacity="0.22"/>
      <rect x="-110" y="-20" width="350" height="190" rx="28" fill="#FFF7FB" opacity="0.94"/>
      <rect x="-86" y="4" width="302" height="132" rx="18" fill="#21131F"/>
      <path d="M-58 ${line}C-14 42 44 122 92 72C122 40 154 48 188 76" fill="none" stroke="#E040A8" stroke-width="7" stroke-linecap="round"/>
      <path d="M-56 106H188" stroke="#F5D7FF" stroke-width="3" stroke-linecap="round" opacity="0.35"/>
      <circle cx="82" cy="-54" r="42" fill="#F8E3FF"/>
      <path d="M46 -42C64 -82 103 -82 120 -42C104 -30 63 -30 46 -42Z" fill="#21131F"/>
      <path d="M52 -6C80 -28 104 -26 128 -3V74H52Z" fill="#C026D3"/>
      <path d="M29 52C-6 66 -23 96 -28 128" stroke="#F8E3FF" stroke-width="18" stroke-linecap="round"/>
      <path d="M142 52C176 67 191 95 198 128" stroke="#F8E3FF" stroke-width="18" stroke-linecap="round"/>
      <rect x="-70" y="144" width="270" height="46" rx="20" fill="#21131F" opacity="0.78"/>
      <text x="64" y="164" text-anchor="middle" font-family="Sora, Manrope, Arial" font-size="20" font-weight="900" fill="#FFF7FB">PROYECTO REAL</text>
      <text x="64" y="184" text-anchor="middle" font-family="Manrope, Arial" font-size="13" font-weight="800" fill="#F5D7FF">investigacion apoyada</text>
    </g>`;
}

function frameSvg(frame) {
  const t = frame / totalFrames;
  const flow = (t * 820) % 820;
  const sparkX = 190 + flow;
  const sparkY = 308 - Math.sin(t * Math.PI * 2) * 20;
  const packetOpacity = 0.58 + Math.max(0, wave(frame, 0, 0.34));

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${viewWidth} ${viewHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1280" y2="720">
        <stop stop-color="#21131F"/>
        <stop offset="0.52" stop-color="#7A1E6E"/>
        <stop offset="1" stop-color="#C026D3"/>
      </linearGradient>
      <linearGradient id="warm" x1="120" y1="620" x2="1120" y2="160">
        <stop stop-color="#F59E0B" stop-opacity="0.31"/>
        <stop offset="1" stop-color="#FFF7FB" stop-opacity="0.06"/>
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="16"/></filter>
    </defs>

    <rect width="1280" height="720" fill="url(#bg)"/>
    <path d="M0 530C230 430 335 630 560 540C815 438 885 260 1280 310V720H0Z" fill="url(#warm)"/>
    <g opacity="0.15">
      ${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 70 - 40} 0V720" stroke="#FFF7FB" stroke-width="1"/>`).join('')}
      ${Array.from({ length: 13 }, (_, i) => `<path d="M0 ${i * 60 + 10}H1280" stroke="#FFF7FB" stroke-width="1"/>`).join('')}
    </g>

    <circle cx="${190 + wave(frame, 0.1, 18)}" cy="118" r="92" fill="#E040A8" opacity="0.18" filter="url(#soft)"/>
    <circle cx="${1045 + wave(frame, 1.2, 16)}" cy="160" r="124" fill="#FFF7FB" opacity="0.12" filter="url(#soft)"/>
    <circle cx="${900 + wave(frame, 2.1, 22)}" cy="610" r="96" fill="#F59E0B" opacity="0.11" filter="url(#soft)"/>

    <path d="M190 310C340 232 500 228 640 315C790 408 965 408 1130 310" fill="none" stroke="#FFF7FB" stroke-width="4" stroke-linecap="round" opacity="0.26"/>
    <path d="M190 310C340 232 500 228 640 315C790 408 965 408 1130 310" fill="none" stroke="#F5D7FF" stroke-width="2" stroke-linecap="round" stroke-dasharray="10 18" stroke-dashoffset="${-frame * 2}" opacity="0.88"/>

    <g opacity="${packetOpacity}">
      <circle cx="${sparkX}" cy="${sparkY}" r="9" fill="#FFF7FB"/>
      <text x="${sparkX + 16}" y="${sparkY + 5}" font-family="Manrope, Arial" font-size="13" font-weight="900" fill="#FFF7FB">hash</text>
    </g>
    <circle cx="${sparkX + 86}" cy="${sparkY - 18}" r="5" fill="#F5D7FF" opacity="0.82"/>
    <circle cx="${sparkX + 132}" cy="${sparkY + 16}" r="4" fill="#F59E0B" opacity="0.86"/>

    ${computerNode(190, 310, 46, 'CPU 01', frame, 0)}
    ${computerNode(455, 230, 40, 'CPU 02', frame, 1.4)}
    ${computerNode(930, 350, 44, 'CPU 03', frame, 2.6)}
    ${computerNode(1130, 310, 46, 'CPU 04', frame, 3.7)}
    ${researchProject(frame)}

    <g opacity="0.96">
      <text x="80" y="82" font-family="Sora, Manrope, Arial" font-size="34" font-weight="900" fill="#FFF7FB">Computadoras unidas por una causa</text>
      <text x="82" y="122" font-family="Manrope, Arial" font-size="20" font-weight="700" fill="#F5D7FF">Tu CPU aporta poco; la comunidad junta puede sostener ciencia real.</text>
    </g>

    ${stepCard(76, 585, '1', 'CPU voluntaria', 'tu decides cuanto')}
    ${stepCard(490, 585, '2', 'Calculos verificables', 'muchos hashes suman')}
    ${stepCard(904, 585, '3', 'Apoyo al proyecto', 'financiamiento colectivo')}
  </svg>`;
}

for (let frame = 0; frame < totalFrames; frame += 1) {
  const svg = Buffer.from(frameSvg(frame));
  const file = join(framesDir, `frame-${String(frame).padStart(4, '0')}.png`);
  await sharp(svg).png().toFile(file);
}

execFileSync('ffmpeg', [
  '-y',
  '-framerate',
  String(fps),
  '-i',
  join(framesDir, 'frame-%04d.png'),
  '-vf',
  'format=yuv420p',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '23',
  '-movflags',
  '+faststart',
  output,
], { stdio: 'inherit' });

execFileSync('ffmpeg', ['-y', '-i', output, '-c', 'copy', publicOutput], { stdio: 'inherit' });

rmSync(framesDir, { recursive: true, force: true });
console.log(`Generated ${output}`);
