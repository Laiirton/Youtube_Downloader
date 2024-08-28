import ttkbootstrap as ttk
from gui import YouTubeDownloaderGUI
import logging

def main():
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
    root = ttk.Window(themename="cosmo")
    app = YouTubeDownloaderGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()