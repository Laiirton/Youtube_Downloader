import sys
from pytube import YouTube

def download_video(url, output_path, quality='highest'):
    try:
        yt = YouTube(url)
        
        if quality == 'highest':
            video = yt.streams.get_highest_resolution()
        else:
            video = yt.streams.filter(progressive=True, file_extension='mp4', resolution=quality).first()
        
        if not video:
            print(f"No video found with quality: {quality}")
            return

        video.download(output_path)
        print(f"Downloaded: {yt.title}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python youtube_downloader.py <YouTube URL> <Output Path> [Quality]")
    else:
        url = sys.argv[1]
        output_path = sys.argv[2]
        quality = sys.argv[3] if len(sys.argv) > 3 else 'highest'
        download_video(url, output_path, quality)