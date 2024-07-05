"use client";

import React, { useState, createContext, useContext, useEffect } from 'react';
import { Download, Folder, Video, Music, Info, Sun, Moon } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme: () => setIsDarkTheme(!isDarkTheme) }}>
      {children}
    </ThemeContext.Provider>
  );
};

interface VideoInfo {
  title: string;
  duration: string;
  views: string;
  uploadDate: string;
}

const YouTubeDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('video');
  const [quality, setQuality] = useState('720p');
  const [showInfo, setShowInfo] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadPath, setDownloadPath] = useState('C:\\Downloads');
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error('YouTubeDownloader must be used within a ThemeProvider');
  }

  const { isDarkTheme, toggleTheme } = themeContext;

  const handleDownload = () => {
    console.log('Baixando:', url, format, quality, 'para', downloadPath);
  };

  const handleFetchInfo = () => {
    if (showInfo) {
      setShowInfo(false);
    } else {
      setVideoInfo({
        title: 'Astronomia - Vicetone & Tony Igy',
        duration: '3:19',
        views: '1.2B',
        uploadDate: 'Há 8 anos'
      });
      setShowInfo(true);
    }
  };

  const handleFolderSelect = () => {
    const newPath = prompt("Digite o caminho da pasta de download:", downloadPath);
    if (newPath) setDownloadPath(newPath);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="dark:bg-gray-800 transition-colors duration-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold dark:text-white">YouTube Downloader</CardTitle>
            <Button onClick={toggleTheme} variant="outline" size="icon" className="dark:text-white dark:border-white">
              {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <CardDescription className="dark:text-gray-300">Baixe seus vídeos favoritos do YouTube</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Cole o link do YouTube aqui"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Button onClick={handleFetchInfo} variant="outline" className="dark:text-white dark:border-white">
              <Info className="w-4 h-4 mr-2" />
              Info
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 dark:text-white flex-shrink-0" />
            <Input 
              value={downloadPath} 
              readOnly 
              className="flex-grow dark:bg-gray-700 dark:text-white dark:border-gray-600" 
            />
            <Button onClick={handleFolderSelect} variant="outline" className="dark:text-white dark:border-white whitespace-nowrap">
              Selecionar Pasta
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="dark:text-white">Formato:</span>
            <Select 
              value={format} 
              onValueChange={(value: string) => {
                setFormat(value);
                setQuality(value === 'video' ? '720p' : '128kbps');
              }}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-white">
                <SelectItem value="video"><Video className="w-4 h-4 inline mr-2" /> Vídeo</SelectItem>
                <SelectItem value="audio"><Music className="w-4 h-4 inline mr-2" /> Áudio</SelectItem>
              </SelectContent>
            </Select>
            
            <span className="dark:text-white">Qualidade:</span>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-white">
                {format === 'video' ? (
                  <>
                    <SelectItem value="360p">360p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="128kbps">128kbps</SelectItem>
                    <SelectItem value="192kbps">192kbps</SelectItem>
                    <SelectItem value="256kbps">256kbps</SelectItem>
                    <SelectItem value="320kbps">320kbps</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {showInfo && videoInfo && (
            <Alert className="dark:bg-gray-700 dark:text-white">
              <AlertTitle>Informações do Vídeo</AlertTitle>
              <AlertDescription>
                <p><strong>Título:</strong> {videoInfo.title}</p>
                <p><strong>Duração:</strong> {videoInfo.duration}</p>
                <p><strong>Visualizações:</strong> {videoInfo.views}</p>
                <p><strong>Data de upload:</strong> {videoInfo.uploadDate}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleDownload} className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
            <Download className="w-5 h-5 mr-2" />
            Baixar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const YouTubeDownloaderWithTheme: React.FC = () => (
  <ThemeProvider>
    <YouTubeDownloader />
  </ThemeProvider>
);

export default YouTubeDownloaderWithTheme;