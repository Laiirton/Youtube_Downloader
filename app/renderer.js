const { ipcRenderer } = require('electron');
const path = require('path');
const { exec } = require('child_process');

const videoUrlInput = document.getElementById('video-url');
const downloadBtn = document.getElementById('download-btn');
const selectFolderBtn = document.getElementById('select-folder-btn');
const progressBar = document.getElementById('progress-bar');
const statusMessage = document.getElementById('status-message');

let downloadFolder = '';
let pythonProcess = null; // Para controlar o processo Python

// Evento: clicar no botão "Baixar Vídeo"
downloadBtn.addEventListener('click', () => {
    const videoUrl = videoUrlInput.value.trim();

    if (!videoUrl) {
        statusMessage.textContent = 'Por favor, insira uma URL de vídeo válida.';
        return;
    }

    if (!downloadFolder) {
        statusMessage.textContent = 'Por favor, selecione uma pasta de destino.';
        return;
    }

    // Inicia o download (se não houver outro em andamento)
    if (!pythonProcess) {
        startDownload(videoUrl, downloadFolder);
    } else {
        statusMessage.textContent = 'Um download já está em andamento.';
    }
});

// Evento: clicar no botão "Escolher Pasta"
selectFolderBtn.addEventListener('click', () => {
    ipcRenderer.send('select-folder');
});

// Recebe a pasta selecionada do processo principal
ipcRenderer.on('folder-selected', (event, folderPath) => {
    downloadFolder = folderPath;
    statusMessage.textContent = `Pasta selecionada: ${folderPath}`;
});

// Função para iniciar o download
function startDownload(videoUrl, folderPath) {
    statusMessage.textContent = 'Iniciando download...';
    progressBar.value = 0;

    const pythonScriptPath = path.join(__dirname, '..', 'python_scripts', 'downloader.py');
    const command = `python "${pythonScriptPath}" "${videoUrl}" "${folderPath}"`;

    const pythonProcess = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro no script Python: ${error}`);
            statusMessage.textContent = `Erro no download: ${error}`;
            return;
        }

        console.log(`Saída do script Python: ${stdout}`);
        statusMessage.textContent = 'Download concluído!';
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        const message = data.toString();

        if (message.startsWith('Progresso:')) {
            const progress = parseFloat(message.split(':')[1].trim());
            progressBar.value = progress;
            statusMessage.textContent = `Progresso: ${progress.toFixed(2)}%`;
        } else {
            console.error(`Erro no script Python: ${message}`);
            statusMessage.textContent = `Erro no download: ${message}`;
        }
    });
}