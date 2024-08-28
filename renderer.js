const form = document.getElementById('download-form');
const progressBar = document.getElementById('progress-bar');
const status = document.getElementById('status');
const browseButton = document.getElementById('browse-button');
const qualitySelect = document.getElementById('quality');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('video-url').value;
    const outputPath = document.getElementById('output-path').value;
    const quality = qualitySelect.value;

    if (!url || !outputPath) {
        status.textContent = 'Por favor, insira uma URL e selecione um local para salvar.';
        status.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => status.classList.remove('animate__animated', 'animate__shakeX'), 1000);
        return;
    }

    status.textContent = 'Iniciando download...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    try {
        console.log('Iniciando download com os seguintes parâmetros:', { url, outputPath, quality });
        const result = await window.electronAPI.downloadVideo({ url, outputPath, quality });
        console.log('Download result:', result);
        status.textContent = 'Download completed successfully!';
        status.classList.add('animate__animated', 'animate__tada');
        setTimeout(() => status.classList.remove('animate__animated', 'animate__tada'), 1000);
    } catch (error) {
        console.error('Erro no download:', error);
        status.textContent = `Erro: ${error.message || error}`;
        status.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => status.classList.remove('animate__animated', 'animate__shakeX'), 1000);
    }
});

window.electronAPI.onDownloadProgress((event, data) => {
    const percent = data.percent.toFixed(1);
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${percent}%`;
    status.textContent = `Downloaded: ${data.downloaded} of ${data.totalSize} | Speed: ${data.currentSpeed} | ETA: ${data.eta}`;
});

window.electronAPI.onDownloadComplete(() => {
    status.textContent = 'Download completed successfully!';
    status.classList.add('animate__animated', 'animate__tada');
    setTimeout(() => status.classList.remove('animate__animated', 'animate__tada'), 1000);
});

window.electronAPI.onDownloadError((event, error) => {
    console.error('Download error:', error);
    status.textContent = `Error: ${error}`;
    status.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => status.classList.remove('animate__animated', 'animate__shakeX'), 1000);
});

browseButton.addEventListener('click', async () => {
    const result = await window.electronAPI.openFolderDialog();
    if (result) {
        document.getElementById('output-path').value = result;
        console.log('Selected output path:', result); // Log para verificar o caminho selecionado
    }
});

// Verifique se os botões de controle já existem
if (!document.querySelector('.window-controls-container')) {
    const windowControlsContainer = document.createElement('div');
    windowControlsContainer.className = 'window-controls-container';

    const windowControls = document.createElement('div');
    windowControls.className = 'window-controls';

    const minimizeButton = document.createElement('button');
    minimizeButton.className = 'control-button';
    minimizeButton.innerHTML = '&#8211;';
    minimizeButton.addEventListener('click', () => window.electronAPI.minimizeWindow());

    const maximizeButton = document.createElement('button');
    maximizeButton.className = 'control-button';
    maximizeButton.innerHTML = '&#9633;';
    maximizeButton.addEventListener('click', () => window.electronAPI.maximizeWindow());

    const closeButton = document.createElement('button');
    closeButton.className = 'control-button';
    closeButton.innerHTML = '&#10005;';
    closeButton.addEventListener('click', () => window.electronAPI.closeWindow());

    windowControls.appendChild(minimizeButton);
    windowControls.appendChild(maximizeButton);
    windowControls.appendChild(closeButton);

    windowControlsContainer.appendChild(windowControls);
    document.body.appendChild(windowControlsContainer);

    // Adicione a região arrastável
    const dragRegion = document.createElement('div');
    dragRegion.className = 'drag-region';
    document.body.appendChild(dragRegion);
}

document.getElementById('video-url').addEventListener('blur', async () => {
    const url = document.getElementById('video-url').value;
    if (url) {
        try {
            const formats = await window.electronAPI.getVideoFormats(url);
            qualitySelect.innerHTML = '';
            formats.forEach(format => {
                const option = document.createElement('option');
                option.value = format.format_id;
                const filesize = format.filesize ? `${(format.filesize / 1024 / 1024).toFixed(2)} MB` : 'N/A';
                option.textContent = `${format.qualityLabel} (${format.container}) - ${format.fps || 'N/A'} FPS - ${filesize}`;
                qualitySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching video formats:', error);
            status.textContent = `Erro ao obter formatos de vídeo: ${error.message}`;
        }
    }
});