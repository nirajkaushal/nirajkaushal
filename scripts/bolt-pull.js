const fs = require("fs")
const path = require("path")
const { join } = path
const { existsSync, mkdirSync, writeFileSync } = fs

const slug = "github-indurp9j" // Replace with your desired slug
const API_URL = "https://bolt.new/api/import/stackblitz"

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
const fetchStackBlitzProject = async () => {
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
  console.log("Fetching project data...")
  const appFiles = await fetchStackBlitzProject()

  console.log("Creating project...")

  Object.values(appFiles.appFiles).forEach((file) => {
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
