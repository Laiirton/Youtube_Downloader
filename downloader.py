import yt_dlp
import os
import logging
import requests
import re
from pytube import YouTube

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class YouTubeDownloader:
    def download(self, url, output_path, quality, progress_callback):
        try:
            logging.info(f"Tentando baixar o vídeo da URL: {url}")
            
            # Verifica se a URL é acessível
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception(f"Não foi possível acessar a URL. Código de status: {response.status_code}")

            # Tenta baixar com yt-dlp
            try:
                self._download_with_ytdlp(url, output_path, quality, progress_callback)
            except Exception as e:
                logging.warning(f"Falha ao baixar com yt-dlp: {str(e)}. Tentando com pytube...")
                self._download_with_pytube(url, output_path, quality, progress_callback)

        except Exception as e:
            error_message = f"Ocorreu um erro inesperado: {str(e)}"
            logging.error(error_message)
            raise Exception(error_message)

    def _download_with_ytdlp(self, url, output_path, quality, progress_callback):
        format_string = self._get_format_string(quality)
        ydl_opts = {
            'format': format_string,
            'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
            'progress_hooks': [lambda d: self._ytdlp_progress_hook(d, progress_callback)],
            'nocheckcertificate': True,
            'ignoreerrors': False,
            'logtostderr': False,
            'quiet': False,
            'no_warnings': False,
            'default_search': 'auto',
            'source_address': '0.0.0.0',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                ydl.download([url])
            except yt_dlp.utils.DownloadError as e:
                logging.error(f"Erro ao baixar o vídeo: {str(e)}")
                raise Exception(f"Erro ao baixar o vídeo: {str(e)}")

    def _download_with_pytube(self, url, output_path, quality, progress_callback):
        yt = YouTube(url)
        yt.register_on_progress_callback(lambda stream, chunk, bytes_remaining: 
            progress_callback((1 - bytes_remaining / stream.filesize) * 100))
        
        streams = yt.streams.filter(progressive=True, file_extension='mp4')
        if quality == "high":
            stream = streams.order_by('resolution').desc().first()
        elif quality == "medium":
            stream = streams.order_by('resolution').desc().last()
        else:  # low
            stream = streams.order_by('resolution').asc().first()
        
        if stream:
            stream.download(output_path=output_path)
        else:
            raise Exception("Não foi possível encontrar um stream adequado para a qualidade selecionada.")

    def _ytdlp_progress_hook(self, d, callback):
        if d['status'] == 'downloading':
            try:
                percent = d.get('_percent_str', '0%')
                percent = re.sub(r'\x1b\[[0-9;]*m', '', percent)  # Remove códigos de cor ANSI
                percent = percent.replace('%', '').strip()
                callback(float(percent))
            except ValueError:
                logging.warning(f"Não foi possível analisar o progresso: {d.get('_percent_str', 'N/A')}")
        elif d['status'] == 'finished':
            callback(100)

    def _get_format_string(self, quality):
        if quality == "high":
            return 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
        elif quality == "medium":
            return 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]'
        else:  # low
            return 'worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst[ext=mp4]/worst'