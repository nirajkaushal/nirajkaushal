const fs = require("fs")
const path = require("path")
const { chalk } = require("chalk")
const { join } = path
const { existsSync, mkdirSync, writeFileSync } = fs

const API_URL = "https://bolt.new/api/import/stackblitz"

// Get project slug from command-line arguments
const slug = process.argv[2]
if (!slug) {
  console.log(chalk.red("Error: Please provide a project slug as an argument."))
  console.log(chalk.yellow("Usage: node script.js <project-slug>"))
  process.exit(1)
}

console.log(chalk.blue(`Fetching project data for: ${chalk.bold(slug)}`))

const createDir = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
    console.log(chalk.green(`Created folder: ${dirPath}`))
  }
}

const createFile = (filePath, content = "") => {
  writeFileSync(filePath, content)
  console.log(chalk.cyan(`Created file: ${filePath}`))
}

const fetchStackBlitzProject = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ slug }),
    })

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

    return await response.json()
  } catch (error) {
    console.error(chalk.red("Error fetching StackBlitz data:"), error.message)
    process.exit(1)
  }
}

const createProjectFromResponse = async () => {
  console.log(chalk.blue("Creating project..."))
  const appFiles = await fetchStackBlitzProject()

  Object.values(appFiles.appFiles).forEach((file) => {
    if (!file.fullPath) {
      console.warn(
        chalk.yellow(`Skipping file/folder: ${file.name} (missing fullPath)`)
      )
      return
    }

    const fullPath = join(__dirname, file.fullPath)

    if (file.type === "folder") {
      createDir(fullPath)
    } else if (file.type === "file") {
      createFile(fullPath, file.contents || "")
    }
  })

  console.log(chalk.green.bold("Project successfully created!"))
}

createProjectFromResponse()
