const downloadBtn = document.getElementById('download-btn');

downloadBtn.addEventListener('click', () => {
  const videoUrl = document.getElementById('video-url').value;
  // Chame a função para baixar o vídeo usando Python
  downloadVideo(videoUrl);
});

// Função para chamar o código Python
function downloadVideo(url) {
  const PythonShell = require('python-shell');

  let options = {
    mode: 'text',
    pythonPath: '/usr/bin/python3', // Caminho para o executável Python
    scriptPath: '../python' // Diretório que contém o script Python
  };

  PythonShell.run('downloader.py', options, function (err, results) {
    if (err) throw err;
    console.log('Vídeo baixado:', results);
  });
}