import pytube  # Biblioteca para interagir com o YouTube
import sys     # Para acessar argumentos da linha de comando
from pytube.exceptions import PytubeError


def on_progress(stream, chunk, bytes_remaining):
  total_size = stream.filesize # Tamanho total do arquivo
  bytes_downloaded = total_size - bytes_remaining # Bytes já baixados
  percentage = (bytes_downloaded / total_size) * 100 # Porcentagem baixada
  print(f"Progresso: {percentage:.2f}%") # Exibe o progresso
  
  
def download_video(video_url, output_path):
  try:
    yt = pytube.YouTube(video_url, on_progress_callback=on_progress) # Cria um objeto YouTube
    stream = yt.streams.get_highest_resolution() # Pega o stream com a maior resolução
    stream.download(output_path=output_path) # Baixa o vídeo
    print("Download concluído!")
  except PytubeError as e:
    print(f"Erro ao baixar o vídeo: {e}")
  except Exception as e:
    print(f"Erro inesperado: {e}")
    
    
if __name__ == "__main__":
  if len(sys.argv) < 3:
    print("Uso: <video_url> <output_path>") # Instruções de uso
  else:
    video_url = sys.argv[1]  # URL do vídeo (1º argumento)
    output_path = sys.argv[2] # Pasta de destino (2º argumento)
    download_video(video_url, output_path) # Chama a função de download