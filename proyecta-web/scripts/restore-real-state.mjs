import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const storePath = path.join(projectRoot, "backend", "data", "store.json")
const backupPath = path.join(projectRoot, "backend", "data", "store.real-backup.json")
const lastSimulationPath = path.join(projectRoot, "backend", "data", "store.last-simulation.json")

if (!fs.existsSync(backupPath)) {
  throw new Error(`No existe respaldo real en ${backupPath}. No se puede restaurar con seguridad.`)
}

const currentStore = JSON.parse(fs.readFileSync(storePath, "utf8"))
if (currentStore.__simulationMeta) {
  fs.writeFileSync(lastSimulationPath, `${JSON.stringify(currentStore, null, 2)}\n`, "utf8")
}

const realStore = JSON.parse(fs.readFileSync(backupPath, "utf8"))
delete realStore.__simulationMeta

fs.writeFileSync(storePath, `${JSON.stringify(realStore, null, 2)}\n`, "utf8")

console.log(
  JSON.stringify(
    {
      ok: true,
      restored: storePath,
      backup: backupPath,
      users: realStore.users.length  0,
      posts: realStore.posts.length  0,
      reviews: realStore.reviews.length  0,
      comments: realStore.comments.length  0,
      votes: realStore.votes.length  0,
    },
    null,
    2,
  ),
)
