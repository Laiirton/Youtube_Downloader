const form = document.getElementById('download-form');
const progressBar = document.getElementById('progress-bar');
const status = document.getElementById('status');
const browseButton = document.getElementById('browse-button');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('video-url').value;
    const outputPath = document.getElementById('output-path').value;
    const quality = document.getElementById('quality').value;

    if (!url || !outputPath) {
        status.textContent = 'Please enter a URL and select a save location.';
        return;
    }

    status.textContent = 'Downloading...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    try {
        await window.electronAPI.downloadVideo({ url, outputPath, quality });
    } catch (error) {
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
    status.textContent = `Error: ${error}`;
});

browseButton.addEventListener('click', () => {
    // In a real Electron app, you would use the dialog API to open a folder selection dialog
    // For this example, we'll just show an alert
    alert('In a real Electron app, this would open a folder selection dialog.');
});