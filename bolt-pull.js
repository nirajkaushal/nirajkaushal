const fs = require("fs")
const path = require("path")
const readline = require("readline")
const { join } = path
const { existsSync, mkdirSync, writeFileSync } = fs

const API_URL = "https://bolt.new/api/import/stackblitz"

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Function to get project slug from user
const getProjectSlug = () => {
  return new Promise((resolve) => {
    rl.question("Enter the project slug: ", (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// Function to create directories
const createDir = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
    console.log(`Created folder: ${dirPath}`)
  }
}

// Function to create files
const createFile = (filePath, content = "") => {
  writeFileSync(filePath, content)
  console.log(`Created file: ${filePath}`)
}

// Function to fetch the StackBlitz response
const fetchStackBlitzProject = async (slug) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1", // Some APIs block non-browser requests
      },
      body: JSON.stringify({ slug }),
    })

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

    return await response.json()
  } catch (error) {
    console.error("Error fetching StackBlitz data:", error.message)
    process.exit(1)
  }
}

// Function to construct the project
const createProjectFromResponse = async () => {
  const slug = await getProjectSlug()
  if (!slug) {
    console.error("Project slug is required!")
    process.exit(1)
  }

  console.log("Fetching project data...")
  const response = await fetchStackBlitzProject(slug)

  console.log("Creating project...")

  Object.values(response.appFiles).forEach((file) => {
    if (!file.fullPath) {
      console.warn(`Skipping file/folder: ${file.name} (missing fullPath)`)
      return // Skip if fullPath is missing
    }

    const fullPath = join(__dirname, file.fullPath)

    if (file.type === "folder") {
      createDir(fullPath)
    } else if (file.type === "file") {
      createFile(fullPath, file.contents || "")
    }
  })

  console.log("Project successfully created!")
}

// Execute the script
createProjectFromResponse()
