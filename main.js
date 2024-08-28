const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ytdl = require('ytdl-core');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('download-video', async (event, { url, outputPath, quality }) => {
  try {
    const info = await ytdl.getInfo(url);
    let format;
    
    if (quality === 'high') {
      format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
    } else if (quality === 'medium') {
      format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: format => format.container === 'mp4' });
    } else {
      format = ytdl.chooseFormat(info.formats, { quality: 'lowestvideo' });
    }

    const output = path.join(outputPath, `${info.videoDetails.title}.${format.container}`);
    const video = ytdl(url, { format });

    let starttime;
    video.pipe(fs.createWriteStream(output));

    video.once('response', () => {
      starttime = Date.now();
    });

    video.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total;
      const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
      const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
      
      event.sender.send('download-progress', {
        percent: percent * 100,
        downloaded: (downloaded / 1024 / 1024).toFixed(2),
        total: (total / 1024 / 1024).toFixed(2),
        estimatedTime: estimatedDownloadTime.toFixed(2)
      });
    });

    video.on('end', () => {
      event.sender.send('download-complete');
    });

  } catch (error) {
    event.sender.send('download-error', error.message);
  }
});