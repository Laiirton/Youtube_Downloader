const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { PythonShell } = require('python-shell');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled) {
      event.reply('selected-directory', result.filePaths[0]);
    }
  }).catch(err => {
    console.log(err);
  });
});

ipcMain.on('download-video', (event, { url, outputPath, quality }) => {
  let options = {
    mode: 'text',
    pythonPath: 'python3', // Alterado para 'python3'
    args: [url, outputPath, quality],
  };

  let pyshell = new PythonShell('youtube_downloader.py', options);

  pyshell.on('message', function (message) {
    console.log(message);
    event.reply('python-output', message);
  });

  pyshell.end(function (err, code, signal) {
    if (err) {
      console.error('Erro:', err);
      event.reply('download-error', err.toString());
    } else {
      console.log('O código de saída foi: ' + code);
      console.log('O sinal de saída foi: ' + signal);
      console.log('finalizado');
      event.reply('download-complete');
    }
  });

  // Simulate download progress (replace this with actual progress tracking)
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 10;
    if (progress <= 100) {
      event.reply('download-progress', progress);
    } else {
      clearInterval(progressInterval);
    }
  }, 500);
});