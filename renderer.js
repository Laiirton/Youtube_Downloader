const { ipcRenderer } = require('electron');

const urlInput = document.getElementById('url-input');
const resolutionSelect = document.getElementById('resolution');
const pathButton = document.getElementById('path-button');
const downloadButton = document.getElementById('download-button');
const progressBar = document.getElementById('progress-bar');
const statusLabel = document.getElementById('status-label');
const minimizeButton = document.getElementById('minimize-button');
const closeButton = document.getElementById('close-button');

let savePath = '';

pathButton.addEventListener('click', () => {
    ipcRenderer.send('choose-directory');
});

ipcRenderer.on('directory-selected', (event, path) => {
    savePath = path;
    statusLabel.textContent = `Pasta de destino: ${path}`;
});

downloadButton.addEventListener('click', () => {
    const url = urlInput.value;
    const resolution = resolutionSelect.value;

    if (!url || !savePath) {
        statusLabel.textContent = 'Por favor, insira a URL e escolha a pasta de destino.';
        return;
    }

    statusLabel.textContent = 'Baixando...';
    downloadButton.disabled = true;
    progressBar.style.width = '0%';

    ipcRenderer.send('start-download', { url, resolution, savePath });
});

ipcRenderer.on('download-progress', (event, percent) => {
    progressBar.style.width = `${percent}%`;
});

ipcRenderer.on('download-complete', () => {
    statusLabel.textContent = 'Download concluído!';
    downloadButton.disabled = false;
    progressBar.style.width = '100%';
    urlInput.value = ''; // Limpa o campo de URL após o download
});

ipcRenderer.on('download-error', (event, error) => {
    statusLabel.textContent = `Erro: ${error}`;
    downloadButton.disabled = false;
});

ipcRenderer.on('download-status', (event, message) => {
    statusLabel.textContent = message;
});

minimizeButton.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});