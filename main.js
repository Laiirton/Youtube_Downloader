const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
    scriptPath: __dirname,
    args: [url, resolution, savePath]
  };

  let pyshell = new PythonShell('youtube_downloader.py', options);

  pyshell.on('message', function (message) {
    if (message.startsWith('PROGRESS:')) {
      const percent = parseFloat(message.split(':')[1]);
      event.reply('download-progress', percent);
    } else if (message === 'COMPLETE') {
      event.reply('download-complete');
    } else if (message.startsWith('ERROR:')) {
      event.reply('download-error', message);
    }
  });

  pyshell.end(function (err) {
    if (err) {
      event.reply('download-error', err.toString());
    }
  });
});

ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('close-window', () => {
  app.quit();
});