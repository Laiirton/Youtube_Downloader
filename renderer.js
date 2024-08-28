const form = document.getElementById('download-form');
const progressBar = document.getElementById('progress-bar');
const status = document.getElementById('status');
const browseButton = document.getElementById('browse-button');
const minimizeButton = document.getElementById('minimize-button');
const maximizeButton = document.getElementById('maximize-button');
const closeButton = document.getElementById('close-button');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('video-url').value;
    const outputPath = document.getElementById('output-path').value;
    const quality = document.getElementById('quality').value;

    if (!url || !outputPath) {
        status.textContent = 'Please enter a URL and select a save location.';
        return;
    }

    status.textContent = 'Initializing download...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    try {
        await window.electronAPI.downloadVideo({ url, outputPath, quality });
    } catch (error) {
        console.error('Download error:', error);
        status.textContent = `Error: ${error}`;
    }
});

window.electronAPI.onDownloadProgress((event, data) => {
    const percent = Math.round(data.percent);
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${percent}%`;
    status.textContent = `Downloaded: ${data.downloaded} MB / ${data.total} MB | Estimated time: ${data.estimatedTime} minutes`;
});

window.electronAPI.onDownloadComplete(() => {
    status.textContent = 'Download completed successfully!';
});

window.electronAPI.onDownloadError((event, error) => {
    console.error('Download error:', error);
    status.textContent = `Error: ${error}`;
});

browseButton.addEventListener('click', async () => {
    const result = await window.electronAPI.openFolderDialog();
    if (result) {
        document.getElementById('output-path').value = result;
    }
});

minimizeButton.addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
});

maximizeButton.addEventListener('click', () => {
    window.electronAPI.maximizeWindow();
});

closeButton.addEventListener('click', () => {
    window.electronAPI.closeWindow();
});