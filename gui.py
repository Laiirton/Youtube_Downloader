import tkinter as tk
from tkinter import filedialog
import ttkbootstrap as ttk
from ttkbootstrap.constants import *
import threading
from downloader import YouTubeDownloader

class YouTubeDownloaderGUI:
    def __init__(self, master):
        self.master = master
        self.downloader = YouTubeDownloader()
        self.master.title("YouTube Downloader")
        self.master.geometry("800x600")
        self.style = ttk.Style(theme="darkly")

        self.create_widgets()

    def create_widgets(self):
        # Main frame
        self.main_frame = ttk.Frame(self.master, padding=20)
        self.main_frame.pack(fill=BOTH, expand=YES)

        # Title
        title_label = ttk.Label(self.main_frame, text="YouTube Downloader", font=("Helvetica", 28, "bold"), bootstyle="inverse-primary")
        title_label.pack(pady=(0, 30))

        # URL input
        url_frame = ttk.Frame(self.main_frame)
        url_frame.pack(fill=X, pady=(0, 20))
        url_label = ttk.Label(url_frame, text="URL do vídeo:", font=("Helvetica", 12))
        url_label.pack(side=LEFT, padx=(0, 10))
        self.url_input = ttk.Entry(url_frame, font=("Helvetica", 12), bootstyle="primary")
        self.url_input.pack(side=LEFT, expand=YES, fill=X)

        # Output path
        path_frame = ttk.Frame(self.main_frame)
        path_frame.pack(fill=X, pady=(0, 20))
        path_label = ttk.Label(path_frame, text="Salvar em:", font=("Helvetica", 12))
        path_label.pack(side=LEFT, padx=(0, 10))
        self.path_input = ttk.Entry(path_frame, font=("Helvetica", 12), bootstyle="primary")
        self.path_input.pack(side=LEFT, expand=YES, fill=X)
        self.path_button = ttk.Button(path_frame, text="Procurar", command=self.choose_output_path, bootstyle="info-outline", width=10)
        self.path_button.pack(side=LEFT, padx=(10, 0))

        # Quality selection
        quality_frame = ttk.Frame(self.main_frame)
        quality_frame.pack(fill=X, pady=(0, 30))
        quality_label = ttk.Label(quality_frame, text="Qualidade:", font=("Helvetica", 12))
        quality_label.pack(side=LEFT, padx=(0, 10))
        self.quality_var = tk.StringVar(value="Alta")
        quality_combo = ttk.Combobox(quality_frame, textvariable=self.quality_var, values=["Alta", "Média", "Baixa"], font=("Helvetica", 12), bootstyle="primary", state="readonly")
        quality_combo.pack(side=LEFT, expand=YES, fill=X)

        # Download button
        self.download_button = ttk.Button(self.main_frame, text="Baixar Vídeo", command=self.start_download, bootstyle="success", width=20)
        self.download_button.pack(pady=(0, 20))

        # Progress bar
        self.progress_bar = ttk.Progressbar(self.main_frame, length=400, bootstyle="success-striped")
        self.progress_bar.pack(pady=(0, 10))

        # Status label
        self.status_label = ttk.Label(self.main_frame, text="", font=("Helvetica", 12), wraplength=760, justify="center")
        self.status_label.pack()

    def choose_output_path(self):
        folder = filedialog.askdirectory()
        if folder:
            self.path_input.delete(0, tk.END)
            self.path_input.insert(0, folder)

    def start_download(self):
        url = self.url_input.get()
        output_path = self.path_input.get()
        quality = self.quality_var.get().lower()

        if not url or not output_path:
            self.status_label.config(text="Por favor, insira uma URL e selecione um local para salvar.")
            return

        self.download_button.config(state=tk.DISABLED)
        self.status_label.config(text="Baixando...")
        self.progress_bar['value'] = 0

        thread = threading.Thread(target=self.download_thread, args=(url, output_path, quality))
        thread.start()

    def download_thread(self, url, output_path, quality):
        try:
            self.downloader.download(url, output_path, quality, self.update_progress)
            self.master.after(0, self.download_finished)
        except Exception as e:
            self.master.after(0, self.download_error, str(e))

    def update_progress(self, progress):
        self.master.after(0, self.progress_bar.config, {'value': progress})

    def download_finished(self):
        self.download_button.config(state=tk.NORMAL)
        self.status_label.config(text="Download concluído com sucesso!")
        self.progress_bar['value'] = 100

    def download_error(self, error_message):
        self.download_button.config(state=tk.NORMAL)
        self.status_label.config(text=f"Erro: {error_message}")
        self.progress_bar['value'] = 0