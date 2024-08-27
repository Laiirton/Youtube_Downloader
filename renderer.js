const { ipcRenderer } = require('electron');

const urlInput = document.getElementById('url-input');
const outputPath = document.getElementById('output-path');
const selectFolderBtn = document.getElementById('select-folder');
const qualitySelect = document.getElementById('quality-select');
const downloadBtn = document.getElementById('download-btn');
const progressBar = document.getElementById('progress');
const status = document.getElementById('status');

selectFolderBtn.addEventListener('click', () => {
    ipcRenderer.send('open-file-dialog');
});

ipcRenderer.on('selected-directory', (event, path) => {
    outputPath.value = path;
});

downloadBtn.addEventListener('click', () => {
    const url = urlInput.value;
    const output = outputPath.value;
    const quality = qualitySelect.value;

    if (!url || !output) {
        status.textContent = 'Please enter a URL and select an output folder';
        return;
    }

    status.textContent = 'Downloading...';
    progressBar.style.width = '0%';

    ipcRenderer.send('download-video', { url, outputPath: output, quality });
});

ipcRenderer.on('download-progress', (event, progress) => {
    progressBar.style.width = `${progress}%`;
});

ipcRenderer.on('download-complete', (event, result) => {
    status.textContent = 'Download complete!';
    progressBar.style.width = '100%';
});

ipcRenderer.on('download-error', (event, error) => {
    status.textContent = `Error: ${error}`;
});