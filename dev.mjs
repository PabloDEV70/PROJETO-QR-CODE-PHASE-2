#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Gigantao Dev Launcher — zero external dependencies
// Usage: node dev.mjs
// ─────────────────────────────────────────────────────────────
import { spawn, execSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = dirname(fileURLToPath(import.meta.url))

// ── ANSI helpers ─────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  bRed: '\x1b[91m', bGreen: '\x1b[92m', bYellow: '\x1b[93m',
  bBlue: '\x1b[94m', bMagenta: '\x1b[95m', bCyan: '\x1b[96m', bWhite: '\x1b[97m',
}
const LOG_COLORS = [C.cyan, C.yellow, C.green, C.magenta, C.blue, C.bRed, C.bGreen, C.bYellow, C.bBlue, C.bMagenta, C.bCyan, C.bWhite]
const w = (s) => process.stdout.write(s)
const log = (s) => console.log(s)

// ── App map ──────────────────────────────────────────────────
const APPS = [
  { id: 'api',          dir: 'api-micro-sankhya',            port: 3000, label: 'API',             type: 'fastify' },
  { id: 'rdo',          dir: 'gig-rdo-vite',                 port: 3001, label: 'RDO',             type: 'vite' },
  { id: 'publico',      dir: 'app-publico-vite',             port: 3002, label: 'Publico',         type: 'vite' },
  { id: 'etiquetas',    dir: 'app-etiquetas-vite',           port: 3003, label: 'Etiquetas',       type: 'vite' },
  { id: 'chamados',     dir: 'app-chamados-vite',            port: 3004, label: 'Chamados',        type: 'vite' },
  { id: 'apontamentos', dir: 'app-rdoapontamentos-vite',     port: 3005, label: 'Apontamentos',    type: 'vite' },
  { id: 'manutencao',   dir: 'app-manutencao-vite',          port: 3006, label: 'Manutencao',      type: 'vite' },
  { id: 'rdomotivos',   dir: 'app-pwa-rdomotivos',           port: 3007, label: 'RDO Motivos',     type: 'vite' },
  { id: 'painel',       dir: 'app-painel-veiculos-vite',     port: 3008, label: 'Painel Veiculos', type: 'vite' },
  { id: 'veiculos',     dir: 'app-gestao-veiculos-pwa-vite', port: 3009, label: 'Gestao Veiculos', type: 'vite' },
  { id: 'tabman',       dir: 'app-tabman-pwa-vite',          port: 3010, label: 'TabMan',          type: 'vite' },
  { id: 'tiadmin',      dir: 'app-ti-admin-vite',            port: 3010, label: 'TI Admin',        type: 'vite' },
  { id: 'grupos',       dir: 'app-gruposeservicos-vite',     port: 3011, label: 'Grupos Servicos', type: 'vite' },
  { id: 'quadro',       dir: 'app-quadro-vite',              port: 3012, label: 'Quadro Veiculos', type: 'vite' },
]

// ── Presets ──────────────────────────────────────────────────
const PRESETS = [
  { label: 'Tudo (API + todos frontends)',     ids: APPS.filter(a => a.id !== 'tiadmin').map(a => a.id) },
  { label: 'API + Chamados',                   ids: ['api', 'chamados'] },
  { label: 'API + RDO + Manutencao',           ids: ['api', 'rdo', 'manutencao'] },
  { label: 'API + Etiquetas',                  ids: ['api', 'etiquetas'] },
  { label: 'API + Publico',                    ids: ['api', 'publico'] },
  { label: 'API + TabMan',                     ids: ['api', 'tabman'] },
  { label: 'API + Veiculos (Painel + Gestao)', ids: ['api', 'painel', 'veiculos'] },
  { label: 'API + RDO Motivos',                ids: ['api', 'rdomotivos'] },
  { label: 'API + Apontamentos',               ids: ['api', 'apontamentos'] },
  { label: 'API + TI Admin',                   ids: ['api', 'tiadmin'] },
  { label: 'API + Grupos e Servicos',          ids: ['api', 'grupos'] },
  { label: 'API + Quadro Veiculos',            ids: ['api', 'quadro'] },
  { label: 'API + Manutencao',                 ids: ['api', 'manutencao'] },
  { label: 'Escolher manualmente...',           ids: null },
]

// ── Interactive prompts (readline-based) ─────────────────────
function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()) })
  })
}

async function selectMenu(title, options) {
  log('')
  log(`${C.bold}${C.cyan}  ${title}${C.reset}`)
  log('')
  for (let i = 0; i < options.length; i++) {
    log(`  ${C.bold}${i + 1}${C.reset}) ${options[i]}`)
  }
  log('')

  while (true) {
    const answer = await ask(`  ${C.dim}Escolha (1-${options.length}):${C.reset} `)
    const n = parseInt(answer, 10)
    if (n >= 1 && n <= options.length) return n - 1
    log(`  ${C.red}Opcao invalida.${C.reset}`)
  }
}

async function multiSelectMenu(title, items) {
  log('')
  log(`${C.bold}${C.cyan}  ${title}${C.reset}`)
  log(`  ${C.dim}Digite os numeros separados por virgula ou espaco (ex: 1,3,5)${C.reset}`)
  log(`  ${C.dim}Enter sem nada = apenas API${C.reset}`)
  log('')
  for (let i = 0; i < items.length; i++) {
    const app = items[i]
    const hint = app.type === 'fastify' ? `${C.yellow}← recomendado${C.reset}` : ''
    log(`  ${C.bold}${String(i + 1).padStart(2)}${C.reset}) ${app.label.padEnd(16)} ${C.dim}:${app.port}${C.reset} ${hint}`)
  }
  log('')

  while (true) {
    const answer = await ask(`  ${C.dim}Apps:${C.reset} `)

    if (!answer) return [0] // default: API only

    const nums = answer.split(/[\s,]+/).map(s => parseInt(s, 10))
    const valid = nums.every(n => n >= 1 && n <= items.length)

    if (valid && nums.length > 0) return [...new Set(nums.map(n => n - 1))]
    log(`  ${C.red}Numeros invalidos. Use 1-${items.length} separados por virgula.${C.reset}`)
  }
}

// ── Helpers ──────────────────────────────────────────────────
function killPort(port) {
  try {
    const pids = execSync(`lsof -t -i:${port} -sTCP:LISTEN 2>/dev/null`, { encoding: 'utf8' }).trim()
    if (pids) {
      for (const pid of pids.split('\n')) {
        try { process.kill(Number(pid)) } catch {}
      }
      return true
    }
  } catch {}
  return false
}

// ── Process management ───────────────────────────────────────
const children = []

function cleanup() {
  log(`\n${C.dim}Parando todos os processos...${C.reset}`)
  for (const child of children) {
    try { process.kill(-child.pid, 'SIGTERM') } catch {}
    try { child.kill('SIGTERM') } catch {}
  }
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// ── Main ─────────────────────────────────────────────────────
async function main() {
  log('')
  log(`  ${C.bold}${C.cyan}╔══════════════════════════════════╗${C.reset}`)
  log(`  ${C.bold}${C.cyan}║   Gigantao Dev Launcher          ║${C.reset}`)
  log(`  ${C.bold}${C.cyan}╚══════════════════════════════════╝${C.reset}`)

  // Step 1: Choose preset or manual
  const presetIdx = await selectMenu('Presets rapidos:', PRESETS.map(p => p.label))
  let selectedIds

  if (PRESETS[presetIdx].ids === null) {
    const indices = await multiSelectMenu('Selecione os apps para iniciar:', APPS)
    selectedIds = indices.map(i => APPS[i].id)
  } else {
    selectedIds = PRESETS[presetIdx].ids
  }

  let selected = APPS.filter(a => selectedIds.includes(a.id))

  // Step 2: Port conflict check (tabman + tiadmin share 3010)
  if (selectedIds.includes('tabman') && selectedIds.includes('tiadmin')) {
    log('')
    log(`  ${C.red}${C.bold}! TabMan e TI Admin compartilham a porta 3010${C.reset}`)
    const keepIdx = await selectMenu('Qual manter?', ['TabMan', 'TI Admin'])
    const removeId = keepIdx === 0 ? 'tiadmin' : 'tabman'
    selected = selected.filter(a => a.id !== removeId)
  }

  if (selected.length === 0) {
    log(`\n  ${C.yellow}Nenhum app selecionado.${C.reset}\n`)
    process.exit(0)
  }

  // Step 3: Kill ports in use
  const portsKilled = []
  for (const app of selected) {
    if (killPort(app.port)) portsKilled.push(app.port)
  }
  if (portsKilled.length > 0) {
    log(`\n  ${C.yellow}Portas liberadas: ${portsKilled.join(', ')}${C.reset}`)
  }

  // Step 4: pnpm install (parallel)
  log('')
  w(`  ${C.dim}Instalando dependencias (${selected.length} apps)...${C.reset}`)

  await Promise.all(selected.map(app => new Promise((resolve) => {
    const child = spawn('pnpm', ['i'], {
      cwd: join(ROOT, app.dir),
      stdio: 'ignore',
      shell: true,
    })
    child.on('close', resolve)
    child.on('error', resolve)
  })))

  log(` ${C.green}OK${C.reset}`)

  // Step 5: Start all apps
  const maxLabelLen = Math.max(...selected.map(a => a.label.length))

  log('')
  log(`  ${C.bold}Iniciando ${selected.length} apps...${C.reset}`)
  log('')

  for (let i = 0; i < selected.length; i++) {
    const app = selected[i]
    const color = LOG_COLORS[i % LOG_COLORS.length]
    const prefix = `${color}[${app.label.padEnd(maxLabelLen)}]${C.reset}`

    const child = spawn('pnpm', ['dev'], {
      cwd: join(ROOT, app.dir),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      detached: true,
    })

    children.push(child)

    const onData = (data) => {
      for (const line of data.toString().split('\n')) {
        if (line.trim()) log(`${prefix} ${line}`)
      }
    }

    child.stdout.on('data', onData)
    child.stderr.on('data', onData)

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        log(`${prefix} ${C.bold}${C.red}Encerrou com codigo ${code}${C.reset}`)
      }
    })

    log(`  ${color}●${C.reset} ${app.label} → http://localhost:${app.port}`)
  }

  log(`\n  ${C.dim}Ctrl+C para parar todos${C.reset}\n`)

  // Keep alive
  await new Promise(() => {})
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
