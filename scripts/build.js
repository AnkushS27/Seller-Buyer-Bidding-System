const { execSync } = require("child_process")

console.log("🔧 Starting custom build process...")

try {
  // Generate Prisma Client
  console.log("📦 Generating Prisma Client...")
  execSync("npx prisma generate", { stdio: "inherit" })

  // Build Next.js application
  console.log("🏗️ Building Next.js application...")
  execSync("npx next build", { stdio: "inherit" })

  console.log("✅ Build completed successfully!")
} catch (error) {
  console.error("❌ Build failed:", error.message)
  process.exit(1)
}
