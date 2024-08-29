import sys
import yt_dlp
import os
import json

def get_available_formats(url):
    ydl_opts = {'quiet': True}
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
    return result

def progress_hook(d):
    if d['status'] == 'downloading':
        p = d['_percent_str']
        p = p.replace('%','')
        print(f"PROGRESS:{p}", flush=True)
    elif d['status'] == 'finished':
        print(f"FINISHED_DOWNLOAD:{d['filename']}", flush=True)

def download_video(url, format_id, save_path):
    try:
        print(f"Iniciando download: URL={url}, Format ID={format_id}, Pasta={save_path}", flush=True)
        
        ydl_opts = {
            'format': f'{format_id}+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': os.path.join(save_path, '%(title)s.%(ext)s'),
            'progress_hooks': [progress_hook],
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            filename = ydl.prepare_filename(info)
            print(f"Arquivo será salvo como: {filename.encode('ascii', 'ignore').decode('ascii')}", flush=True)
            ydl.download([url])
        
        print("COMPLETE", flush=True)
    except Exception as e:
        print(f"ERROR: {str(e)}", flush=True)
        import traceback
        print(traceback.format_exc(), flush=True)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"ERROR: Argumentos incorretos. Recebidos: {sys.argv}", flush=True)
    elif sys.argv[1] == "get_formats":
        print(get_available_formats(sys.argv[2]), flush=True)
    elif len(sys.argv) == 4:
        url, format_id, save_path = sys.argv[1], sys.argv[2], sys.argv[3]
        download_video(url, format_id, save_path)
    else:
        print(f"ERROR: Argumentos incorretos. Recebidos: {sys.argv}", flush=True)