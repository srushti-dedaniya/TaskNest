import http from 'http'

const TARGET_PORT = Number(process.env.VITE_PORT || 3000)
const REDIRECT_PORT = 5173

const server = http.createServer((req, res) => {
  const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost'
  const targetUrl = `http://${host}:${TARGET_PORT}${req.url}`
  console.log(`[redirect-5173] ${req.method} ${req.url} -> ${targetUrl}`)
  res.writeHead(302, {
    Location: targetUrl,
    'Access-Control-Allow-Origin': '*',
  })
  res.end()
})

server.on('error', (err) => {
  console.warn('[redirect-5173] Port 5173 redirect warning:', err.message)
})

server.listen(REDIRECT_PORT, () => {
  console.log(`[redirect-5173] Port ${REDIRECT_PORT} forwarder active -> http://localhost:${TARGET_PORT}`)
})

