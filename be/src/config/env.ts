import 'dotenv/config'

const parsedPort = Number(process.env.PORT ?? 3000)

export const env = {
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}
