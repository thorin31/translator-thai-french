import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const certsDir = path.resolve(__dirname, '../certs')
const useHttps = fs.existsSync(path.join(certsDir, 'cert.pem'))

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    ...(useHttps && {
      https: {
        key: fs.readFileSync(path.join(certsDir, 'key.pem')),
        cert: fs.readFileSync(path.join(certsDir, 'cert.pem')),
      },
    }),
  },
})
