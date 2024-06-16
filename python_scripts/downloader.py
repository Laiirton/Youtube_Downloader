import pytube
import sys
from pytube.exceptions import PytubeError


def on_progress(stream, chunk, bytes_remaining):
    total_size = stream.filesize
    bytes_downloaded = total_size - bytes_remaining
    percentage = (bytes_downloaded / total_size) * 100
    sys.stderr.write(f"Progresso: {percentage:.2f}%\n")
    sys.stderr.flush()  # Força a saída imediata da mensagem

def download_video(video_url, output_path):
    try:
        yt = pytube.YouTube(video_url, on_progress_callback=on_progress)
        stream = yt.streams.get_highest_resolution()
        stream.download(output_path=output_path)
        print("Download concluído!")
    except PytubeError as e:
        print(f"Erro ao baixar o vídeo: {e}")
    except Exception as e:
        print(f"Erro inesperado: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: <video_url> <output_path>")
    else:
        video_url = sys.argv[1]
        output_path = sys.argv[2]
        download_video(video_url, output_path)