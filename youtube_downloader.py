import sys
import os
from pytube import YouTube
from pytube.exceptions import PytubeError
import urllib.request
import json
import time

def get_video_info(video_id):
    params = {"format": "json", "url": "https://www.youtube.com/watch?v=%s" % video_id}
    url = "https://www.youtube.com/oembed"
    query_string = urllib.parse.urlencode(params)
    url = url + "?" + query_string

    with urllib.request.urlopen(url) as response:
        response_text = response.read()
        data = json.loads(response_text.decode())
        return data

def download_video(url, output_path, quality='highest'):
    try:
        print(f"Baixando vídeo da URL: {url}")
        print(f"Caminho de saída: {output_path}")
        print(f"Qualidade selecionada: {quality}")

        if not os.path.exists(output_path):
            print(f"Criando diretório de saída: {output_path}")
            os.makedirs(output_path)

        if not os.access(output_path, os.W_OK):
            print(f"Erro: Sem permissão de escrita para o diretório: {output_path}")
            return

        yt = YouTube(url)
        
        print(f"Título do vídeo: {yt.title}")
        print(f"Streams disponíveis:")
        for stream in yt.streams.filter(progressive=True, file_extension='mp4'):
            print(f"- {stream.resolution}, {stream.mime_type}, {stream.codecs}")

        if quality == 'highest':
            video = yt.streams.get_highest_resolution()
        else:
            video = yt.streams.filter(progressive=True, file_extension='mp4', resolution=quality).first()
        
        if not video:
            print(f"Nenhum vídeo encontrado com a qualidade: {quality}")
            return

        print(f"Stream selecionado: {video.resolution}, {video.mime_type}, {video.codecs}")
        print(f"Baixando vídeo: {yt.title}")
        
        print(f"Aguardando 5 segundos antes de iniciar o download...")
        time.sleep(5)

        file_path = video.download(output_path)
        
        print(f"Download concluído: {yt.title}")
        print(f"Arquivo salvo em: {file_path}")
        
        if os.path.exists(file_path):
            print(f"Tamanho do arquivo: {os.path.getsize(file_path)} bytes")
        else:
            print(f"Erro: Arquivo não encontrado em {file_path}")
    except PytubeError as e:
        print(f"Erro do Pytube: {str(e)}")
        raise
    except Exception as e:
        print(f"Ocorreu um erro: {str(e)}")
        raise

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python youtube_downloader.py <YouTube URL> <Output Path> [Quality]")
    else:
        url = sys.argv[1]
        output_path = sys.argv[2]
        quality = sys.argv[3] if len(sys.argv) > 3 else 'highest'
        download_video(url, output_path, quality)