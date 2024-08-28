import sys
import yt_dlp

def progress_hook(d):
    if d['status'] == 'downloading':
        p = d['_percent_str']
        p = p.replace('%','')
        print(f"PROGRESS:{p}", flush=True)

def download_video(url, resolution, save_path):
    try:
        print(f"Iniciando download: URL={url}, Resolução={resolution}, Pasta={save_path}", flush=True)
        
        ydl_opts = {
            'format': f'bestvideo[height<={resolution[:-1]}]+bestaudio/best[height<={resolution[:-1]}]',
            'outtmpl': f'{save_path}/%(title)s.%(ext)s',
            'progress_hooks': [progress_hook],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        print("COMPLETE", flush=True)
    except Exception as e:
        print(f"ERROR: {str(e)}", flush=True)
        import traceback
        print(traceback.format_exc(), flush=True)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(f"ERROR: Argumentos incorretos. Recebidos: {sys.argv}", flush=True)
    else:
        url, resolution, save_path = sys.argv[1], sys.argv[2], sys.argv[3]
        download_video(url, resolution, save_path)