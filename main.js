const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { PythonShell } = require('python-shell');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    resizable: false,
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('choose-directory', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    event.reply('directory-selected', result.filePaths[0]);
  }
});

ipcMain.on('start-download', (event, { url, resolution, savePath }) => {
  let options = {
    mode: 'text',
    pythonPath: 'python',
    pythonOptions: ['-u'],
    scriptPath: path.join(__dirname),
    args: [url, resolution, savePath],
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  };

  let pyshell = new PythonShell('youtube_downloader.py', options);

  pyshell.on('message', function (message) {
    console.log('Python message:', message);
    if (message.startsWith('PROGRESS:')) {
      const percent = parseFloat(message.split(':')[1]);
      event.reply('download-progress', percent);
    } else if (message === 'COMPLETE') {
      event.reply('download-complete');
    } else if (message.startsWith('ERROR:')) {
      event.reply('download-error', message);
    } else if (message.startsWith('FINISHED_DOWNLOAD:')) {
      const filename = message.split(':')[1];
      event.reply('download-status', `Arquivo salvo: ${filename}`);
    } else {
      event.reply('download-status', message);
    }
  });

  pyshell.end(function (err, code, signal) {
    if (err) {
      console.error('Error:', err);
      event.reply('download-error', err.toString());
    } else {
      event.reply('download-complete');
    }
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
  });
});

ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('close-window', () => {
  app.quit();
});