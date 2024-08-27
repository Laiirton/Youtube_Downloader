import tkinter as tk
from tkinter import filedialog, ttk
import threading
from downloader import YouTubeDownloader

class YouTubeDownloaderGUI:
    def __init__(self, master):
        self.master = master
        self.downloader = YouTubeDownloader()
        self.master.title("YouTube Downloader")
        self.master.geometry("600x400")
        self.master.configure(bg="#f0f0f0")

        self.create_widgets()

    def create_widgets(self):
        # URL input
        url_label = tk.Label(self.master, text="YouTube URL:", bg="#f0f0f0", font=("Arial", 12))
        url_label.pack(pady=(20, 5))
        self.url_input = tk.Entry(self.master, width=50, font=("Arial", 12))
        self.url_input.pack()

        # Output path
        path_label = tk.Label(self.master, text="Output path:", bg="#f0f0f0", font=("Arial", 12))
        path_label.pack(pady=(20, 5))
        path_frame = tk.Frame(self.master, bg="#f0f0f0")
        path_frame.pack()
        self.path_input = tk.Entry(path_frame, width=40, font=("Arial", 12))
        self.path_input.pack(side=tk.LEFT)
        self.path_button = tk.Button(path_frame, text="Browse", command=self.choose_output_path, font=("Arial", 12))
        self.path_button.pack(side=tk.LEFT, padx=(10, 0))

        # Quality selection
        quality_label = tk.Label(self.master, text="Quality:", bg="#f0f0f0", font=("Arial", 12))
        quality_label.pack(pady=(20, 5))
        self.quality_var = tk.StringVar(value="High")
        quality_combo = ttk.Combobox(self.master, textvariable=self.quality_var, values=["High", "Medium", "Low"], font=("Arial", 12))
        quality_combo.pack()

        # Download button
        self.download_button = tk.Button(self.master, text="Download", command=self.start_download, bg="#4CAF50", fg="white", font=("Arial", 14, "bold"))
        self.download_button.pack(pady=20)

        # Progress bar
        self.progress_bar = ttk.Progressbar(self.master, orient=tk.HORIZONTAL, length=400, mode='determinate')
        self.progress_bar.pack(pady=10)

        # Status label
        self.status_label = tk.Label(self.master, text="", bg="#f0f0f0", font=("Arial", 12), wraplength=580, justify="center")
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
            self.status_label.config(text="Please enter a URL and select an output path.")
            return

        self.download_button.config(state=tk.DISABLED)
        self.status_label.config(text="Downloading...")
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
        self.status_label.config(text="Download completed!")
        self.progress_bar['value'] = 0

    def download_error(self, error_message):
        self.download_button.config(state=tk.NORMAL)
        self.status_label.config(text=f"Error: {error_message}")
        self.progress_bar['value'] = 0