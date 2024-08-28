const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
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

function sanitizeFilename(filename) {
  return filename.replace(/[/\\?%*:|"<>]/g, '-');
}

ipcMain.handle('download-video', async (event, { url, outputPath, quality }) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting download for URL: ${url}`);

    const sanitizedOutput = path.join(outputPath, '%(title)s.%(ext)s');

    const args = [
      url,
      '-f', quality,
      '-o', sanitizedOutput,
      '--no-playlist',
      '--newline',
    ];

    console.log('Download command:', youtubedl.execPath, args.join(' ')); // Log do comando

    const downloader = youtubedl.exec(args, {});

    let lastProgress = 0;
    let totalSize = '0B';

    downloader.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        console.log('yt-dlp output:', line); // Log da saída do yt-dlp
        const progressMatch = line.match(/(\d+\.\d+)%\s+of\s+~?(\d+\.\d+)(\w+)\s+at\s+(\d+\.\d+)(\w+\/s)\s+ETA\s+(\d+:\d+)/);
        if (progressMatch) {
          const [, percent, size, unit, speed, speedUnit, eta] = progressMatch;
          totalSize = `${size} ${unit}`;
          const progress = {
            percent: parseFloat(percent),
            totalSize: totalSize,
            downloaded: `${(parseFloat(size) * parseFloat(percent) / 100).toFixed(2)} ${unit}`,
            currentSpeed: `${speed} ${speedUnit}`,
            eta: eta
          };
          
          if (progress.percent > lastProgress + 1) {
            lastProgress = progress.percent;
            event.sender.send('download-progress', progress);
          }
        }
      });
    });

    downloader.on('close', (code) => {
      if (code === 0) {
        console.log('Download completed');
        event.sender.send('download-complete');
        resolve('Download completed successfully');
      } else {
        const error = `Download failed with code ${code}`;
        console.error(error);
        event.sender.send('download-error', error);
        reject(new Error(error));
      }
    });

    downloader.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
  });
});

ipcMain.handle('open-folder-dialog', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

ipcMain.handle('get-video-formats', async (event, url) => {
  try {
    const result = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });
    
    const formats = result.formats
      .filter(format => format.vcodec !== 'none' && format.acodec !== 'none')
      .map(format => ({
        format_id: format.format_id,
        qualityLabel: format.height ? `${format.height}p` : (format.quality_label || 'Audio only'),
        container: format.ext,
        resolution: format.height || 0,
        fps: format.fps || 0,
        filesize: format.filesize,
        vcodec: format.vcodec,
        acodec: format.acodec
      }))
      .sort((a, b) => b.resolution - a.resolution || b.fps - a.fps);

    const uniqueFormats = formats.filter((format, index, self) =>
      index === self.findIndex((t) => t.resolution === format.resolution && t.container === format.container)
    );

    return uniqueFormats;
  } catch (error) {
    console.error('Error fetching video formats:', error);
    throw error;
  }
});

ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});