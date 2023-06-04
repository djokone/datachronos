import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import WebSocket from 'ws';
const webS :any = require('ws');

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  win = null
})

app.whenReady().then(createWindow).then(createWebSocket)

function createWebSocket() {
  // const WebSocket = require('ws')
  console.log('start server websocket')
  // console.log(WebSocket)

  const wss = new webS.Server({ port: 5648 }, () => {
    setTimeout(() => {
      if (win !== null) {
        win.webContents.send('ws', 'WebSocket server started on port 5648')
      }
    }, 1000)
  })
  wss.on('error', (error: Error) => {
    console.error('Error occurred and catched');
    win?.webContents.send('message', 'coucou')
    if (win !== null) {
      setTimeout(() => {
        if (win !== null) {
          win.webContents.send('ws', error.message)
        }
      }, 1000)
      // win.webContents.send('message', error.message)
    }
  })
  wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected')
    ws.on('message', (message: any) => {
      let decoder = new TextDecoder()
      console.log(decoder.decode(message))
      console.log(win)
      if (win !== null) {
        let decodedMessage = decoder.decode(message)
        win.webContents.send('message', decodedMessage)
      }
      console.log(`Received message => ${message}`)
    })
    ws.send('Hello from Electron!')
  })
  // wss.on('error', (error: Error) => {
  //   console.error('Error occurred:', error);
  // });
  console.log('finish websocket')
}
