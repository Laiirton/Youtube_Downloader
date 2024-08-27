from pytube import YouTube
import yt_dlp
import os
from pytube.exceptions import PytubeError
from urllib.error import HTTPError
import logging
import requests
import re

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class YouTubeDownloader:
    def download(self, url, output_path, quality, progress_callback):
        try:
            logging.info(f"Attempting to download video from URL: {url}")
            
            # Check if the URL is accessible
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception(f"Unable to access the URL. Status code: {response.status_code}")

            # Try downloading with yt-dlp
            self._download_with_ytdlp(url, output_path, quality, progress_callback)

        except Exception as e:
            error_message = f"An unexpected error occurred: {str(e)}"
            logging.error(error_message)
            raise Exception(error_message)

    def _download_with_ytdlp(self, url, output_path, quality, progress_callback):
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' if quality == "high" else 'worst[ext=mp4]',
            'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
            'progress_hooks': [lambda d: self._ytdlp_progress_hook(d, progress_callback)],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

    def _ytdlp_progress_hook(self, d, callback):
        if d['status'] == 'downloading':
            try:
                percent = d.get('_percent_str', '0%')
                percent = re.sub(r'\x1b\[[0-9;]*m', '', percent)  # Remove ANSI color codes
                percent = percent.replace('%', '').strip()
                callback(float(percent))
            except ValueError:
                logging.warning(f"Unable to parse progress: {d.get('_percent_str', 'N/A')}")
        elif d['status'] == 'finished':
            callback(100)