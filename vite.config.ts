import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

function sessionTokenApi(): Plugin {
  return {
    name: "session-token-api",
    configureServer(server) {
      server.middlewares.use("/api/session-token", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ error: "Method not allowed" }))
          return
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ error: "Not configured" }))
          return
        }

        try {
          const { GoogleGenAI } = await import("@google/genai")
          const client = new GoogleGenAI({ apiKey })
          const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()

          const token = await (client as any).authTokens.create({
            config: {
              uses: 1,
              expireTime,
              newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
            },
          })

          res.statusCode = 200
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ token: token.name }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json")
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Failed to create session token",
            })
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [sessionTokenApi(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})