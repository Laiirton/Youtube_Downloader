import sys
import yt_dlp
import os
import json
import logging

# Configurar o logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def format_time(seconds):
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

def progress_hook(d):
    if d['status'] == 'downloading':
        percent = d['_percent_str']
        speed = d['_speed_str']
        eta = d['_eta_str']
        
        # Calcula o tempo restante estimado
        if '_eta_str' in d:
            eta_seconds = d.get('eta', 0)
            eta_formatted = format_time(eta_seconds)
        else:
            eta_formatted = "Desconhecido"
        
        # Cria a barra de progresso
        bar_length = 30
        filled_length = int(bar_length * d['downloaded_bytes'] // d['total_bytes'])
        bar = '█' * filled_length + '-' * (bar_length - filled_length)
        
        # Formata a mensagem de progresso
        progress_msg = f"\rProgresso: |{bar}| {percent} | Velocidade: {speed} | ETA: {eta_formatted}"
        
        print(progress_msg, end='', flush=True)
    elif d['status'] == 'finished':
        print(f"\nDownload concluído: {os.path.basename(d['filename'])}", flush=True)

def get_available_formats(url):
    logging.info(f"Obtendo formatos disponíveis para URL: {url}")
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'no_color': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info['formats']
            available_formats = []
            for f in formats:
                if f.get('height') and f.get('ext') == 'mp4':
                    available_formats.append({
                        'format_id': f['format_id'],
                        'resolution': f'{f["height"]}p',
                        'ext': f['ext']
                    })
        result = json.dumps(available_formats)
        logging.info(f"Formatos disponíveis obtidos com sucesso: {result}")
        return result
    except Exception as e:
        logging.error(f"Erro ao obter formatos disponíveis: {str(e)}")
        return json.dumps([])

def get_video_info(url):
    logging.info(f"Obtendo informações do vídeo para URL: {url}")
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'no_color': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            video_info = {
                'title': info['title'],
                'channel': info['channel'],
                'duration': info['duration'],
                'view_count': info['view_count'],
                'thumbnail': info['thumbnail']
            }
        logging.info(f"Informações do vídeo obtidas com sucesso: {video_info}")
        return json.dumps(video_info)
    except Exception as e:
        logging.error(f"Erro ao obter informações do vídeo: {str(e)}")
        return json.dumps({})

def download_video(url, format_id, save_path):
    logging.info(f"Iniciando download do vídeo. URL: {url}, Formato: {format_id}, Caminho: {save_path}")
    try:
        ydl_opts = {
            'format': f'{format_id}+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': os.path.join(save_path, '%(title)s.%(ext)s'),
            'progress_hooks': [progress_hook],
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
            'merge_output_format': 'mp4',
            'quiet': True,
            'no_warnings': True,
            'no_color': True,
            'noprogress': True,
            'check_formats': True,
            'ignoreerrors': False,
            'continuedl': True,
            'retries': 10,
            'fragment_retries': 10,
            'skip_unavailable_fragments': False,
            'keepvideo': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            filename = ydl.prepare_filename(info)
            print(f"Iniciando download: {os.path.basename(filename)}", flush=True)
            ydl.download([url])
        
        if os.path.exists(filename):
            file_size = os.path.getsize(filename)
            if file_size > 0:
                print("\nCOMPLETE", flush=True)
                logging.info(f"Download concluído com sucesso: {filename}")
            else:
                raise Exception("O arquivo baixado está vazio")
        else:
            raise Exception("O arquivo não foi baixado corretamente")
        
    except Exception as e:
        print(f"\nERROR: {str(e)}", flush=True)
        logging.error(f"Erro durante o download do vídeo: {str(e)}")
        import traceback
        print(traceback.format_exc(), flush=True)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"ERROR: Argumentos incorretos. Recebidos: {sys.argv}", flush=True)
        logging.error(f"Argumentos incorretos. Recebidos: {sys.argv}")
    elif sys.argv[1] == "get_formats":
        print(get_available_formats(sys.argv[2]), flush=True)
    elif sys.argv[1] == "get_info":
        print(get_video_info(sys.argv[2]), flush=True)
    elif len(sys.argv) == 4:
        url, format_id, save_path = sys.argv[1], sys.argv[2], sys.argv[3]
        download_video(url, format_id, save_path)
    else:
        print(f"ERROR: Argumentos incorretos. Recebidos: {sys.argv}", flush=True)
        logging.error(f"Argumentos incorretos. Recebidos: {sys.argv}")
