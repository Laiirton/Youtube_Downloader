const { ipcRenderer } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

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
    progressBar.value = 0; // Reinicia a barra de progresso

    const pythonScriptPath = path.join(__dirname, '..', 'python_scripts', 'youtube_downloader.py');

    // Executa o script Python
    pythonProcess = spawn('python', [pythonScriptPath, videoUrl, folderPath]);

    pythonProcess.stdout.on('data', (data) => {
        const message = data.toString();

        if (message.startsWith('Progresso:')) {
            const progress = parseFloat(message.split(':')[1].trim());
            progressBar.value = progress;
            statusMessage.textContent = `Progresso: ${progress.toFixed(2)}%`;
        } else {
            console.log(message); // Outras mensagens do Python
        }
    });

    pythonProcess.stderr.on('data', (data) => {
      const errorMessage = data.toString();
      console.error(`Erro no script Python: ${errorMessage}`);
      statusMessage.textContent = `Erro no download: ${errorMessage}`;
  });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            statusMessage.textContent = 'Download concluído!';
        } else {
            statusMessage.textContent = 'O download falhou.';
        }
        pythonProcess = null; // Limpa o processo ao finalizar
    });
}
