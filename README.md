# YouTube Downloader

A simple YouTube video downloader application with a graphical user interface.

## Installation

1. Ensure you have Python 3.7 or later installed on your system.

2. Clone this repository:
   ```
   git clone https://github.com/yourusername/youtube_downloader.git
   cd youtube_downloader
   ```

3. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   ```

4. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS and Linux:
     ```
     source venv/bin/activate
     ```

5. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Run the application:
   ```
   python main.py
   ```

2. Enter the YouTube URL of the video you want to download.

3. Choose the output path where you want to save the video.

4. Select the desired quality.

5. Click the "Download" button to start the download process.

6. The application will display the download progress and show a message when the download is complete.

## Troubleshooting

If you encounter any issues, please check the console output for error messages and logging information. This information can help identify and resolve problems.

## Dependencies

- pytube: For downloading YouTube videos
- requests: For checking URL accessibility

For the exact versions of the dependencies, please refer to the `requirements.txt` file.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
