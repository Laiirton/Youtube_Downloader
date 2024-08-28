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
        self.master.geometry("900x650")
        self.master.resizable(False, False)
        self.style = ttk.Style(theme="cosmo")

        self.create_widgets()

    def create_widgets(self):
        # Main frame
        self.main_frame = ttk.Frame(self.master, padding=30)
        self.main_frame.pack(fill=BOTH, expand=YES)

        # URL input
        url_frame = ttk.Frame(self.main_frame)
        url_frame.pack(fill=X, pady=(0, 20))
        url_label = ttk.Label(url_frame, text="Video URL:", font=("Roboto", 14))
        url_label.pack(side=LEFT, padx=(0, 10))
        self.url_input = ttk.Entry(url_frame, font=("Roboto", 14), bootstyle="danger")
        self.url_input.pack(side=LEFT, expand=YES, fill=X)

        # Output path
        path_frame = ttk.Frame(self.main_frame)
        path_frame.pack(fill=X, pady=(0, 20))
        path_label = ttk.Label(path_frame, text="Save to:", font=("Roboto", 14))
        path_label.pack(side=LEFT, padx=(0, 10))
        self.path_input = ttk.Entry(path_frame, font=("Roboto", 14), bootstyle="danger")
        self.path_input.pack(side=LEFT, expand=YES, fill=X)
        self.path_button = ttk.Button(path_frame, text="Browse", command=self.choose_output_path, bootstyle="outline-primary", width=10)
        self.path_button.pack(side=LEFT, padx=(10, 0))

        # Quality selection
        quality_frame = ttk.Frame(self.main_frame)
        quality_frame.pack(fill=X, pady=(0, 30))
        quality_label = ttk.Label(quality_frame, text="Quality:", font=("Roboto", 14))
        quality_label.pack(side=LEFT, padx=(0, 10))
        self.quality_var = tk.StringVar(value="Select Quality")
        self.quality_combo = ttk.Combobox(quality_frame, textvariable=self.quality_var, font=("Roboto", 14), bootstyle="danger", state="readonly")
        self.quality_combo.pack(side=LEFT, expand=YES, fill=X)

        # Download button
        button_frame = ttk.Frame(self.main_frame)
        button_frame.pack(pady=(0, 20))
        self.download_button = ttk.Button(button_frame, text="Download Video", command=self.start_download, bootstyle="success", width=25)
        self.download_button.pack(side=LEFT)
        
        # Progress bar
        self.progress_bar = ttk.Progressbar(self.main_frame, length=400, bootstyle="success-striped")
        self.progress_bar.pack(pady=(0, 10))

        # Status label
        self.status_label = ttk.Label(self.main_frame, text="", font=("Roboto", 14), wraplength=860, justify="center")
        self.status_label.pack()

        # Window control buttons
        control_frame = ttk.Frame(self.main_frame)
        control_frame.pack(fill=X, pady=(10, 0))
        self.minimize_button = ttk.Button(control_frame, text="_", command=self.minimize_window, bootstyle="outline-secondary", width=5)
        self.minimize_button.pack(side=LEFT, padx=(0, 5))
        self.maximize_button = ttk.Button(control_frame, text="□", command=self.maximize_window, bootstyle="outline-secondary", width=5)
        self.maximize_button.pack(side=LEFT, padx=(0, 5))
        self.close_button = ttk.Button(control_frame, text="X", command=self.close_window, bootstyle="outline-danger", width=5)
        self.close_button.pack(side=LEFT, padx=(0, 5))

    def choose_output_path(self):
        folder = filedialog.askdirectory()
        if folder:
            self.path_input.delete(0, tk.END)
            self.path_input.insert(0, folder)

    def start_download(self):
        url = self.url_input.get()
        output_path = self.path_input.get()
        quality = self.quality_var.get()

        if not url or not output_path:
            self.status_label.config(text="Please enter a URL and select a save location.")
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
        self.status_label.config(text="Download completed successfully!")
        self.progress_bar['value'] = 100

    def download_error(self, error_message):
        self.download_button.config(state=tk.NORMAL)
        self.status_label.config(text=f"Error: {error_message}")
        self.progress_bar['value'] = 0

    def minimize_window(self):
        self.master.iconify()

    def maximize_window(self):
        if self.master.state() == 'zoomed':
            self.master.state('normal')
        else:
            self.master.state('zoomed')

    def close_window(self):
        self.master.destroy()