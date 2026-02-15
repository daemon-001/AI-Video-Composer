import { useState, useRef, useEffect } from 'react';
import { Maximize2, Download, Settings, MoreHorizontal, Send, Video, Music, X, Image as ImageIcon, Moon, Sun, Film, Sparkles } from 'lucide-react';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  thumbnail: string;
  file: File;
}

interface PreviewCanvasProps {
  videoUrl?: string | null;
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
  onProcess?: (prompt: string) => void;
  isProcessing?: boolean;
  assets?: MediaAsset[];
  onRemoveAsset?: (assetId: string) => void;
  isDarkMode?: boolean;
}

export const PreviewCanvas = ({
  videoUrl,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onProcess,
  isProcessing = false,
  assets = [],
  onRemoveAsset,
  isDarkMode = false,
}: PreviewCanvasProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleSendPrompt = () => {
    if (prompt.trim() && onProcess) {
      onProcess(prompt);
      // Optionally clear prompt after sending
      // setPrompt('');
    }
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'output.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content Area - Create and Evaluate Sections */}
      <div className="flex-1 flex overflow-hidden">
        {/* Middle Section - Create */}
        <div className={`w-1/2 border-r flex flex-col ${
          isDarkMode 
            ? 'bg-[#1a1a1a] border-[#404040]' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Section Header */}
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'border-[#404040]' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${
                isDarkMode 
                  ? 'from-purple-500 to-blue-500' 
                  : 'from-purple-600 to-blue-600'
              }`}></div>
              <h3 className={`text-sm font-semibold tracking-wide ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Create</h3>
            </div>
          </div>

          {/* File Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-3 auto-rows-min">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`group relative rounded-lg overflow-hidden transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'bg-[#2a2a2a] hover:bg-[#323232] ring-1 ring-[#404040] hover:ring-blue-500/50' 
                      : 'bg-white hover:shadow-lg ring-1 ring-gray-200 hover:ring-blue-400/50'
                  }`}
                >
                  {/* Remove Icon */}
                  <button
                    className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRemoveAsset) {
                        onRemoveAsset(asset.id);
                      }
                    }}
                    title="Remove from Create grid"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="aspect-video bg-gray-100 relative">
                    {asset.type === 'audio' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                        <Music className="w-10 h-10 text-white" />
                      </div>
                    ) : asset.type === 'video' && !asset.thumbnail ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600">
                        <Video className="w-10 h-10 text-white" />
                      </div>
                    ) : (
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* File Type Icon Badge */}
                    <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-md px-2 py-1 flex items-center gap-1.5">
                      {asset.type === 'video' && <Video className="w-3 h-3 text-white" />}
                      {asset.type === 'audio' && <Music className="w-3 h-3 text-white" />}
                      {asset.type === 'image' && <ImageIcon className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className={`px-3 py-2 border-t ${
                    isDarkMode ? 'border-[#404040]' : 'border-gray-100'
                  }`}>
                    <p className={`text-xs font-medium truncate ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{asset.name}</p>
                  </div>
                </div>
              ))}
              {assets.length === 0 && (
                <div className="col-span-4 text-center py-12">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${
                    isDarkMode 
                      ? 'bg-[#2a2a2a]' 
                      : 'bg-gray-100'
                  }`}>
                    <Video className={`w-8 h-8 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className={`text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>No files selected</p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}>Add files from the sidebar</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Input Section */}
          <div className={`border-t p-6 ${
            isDarkMode 
              ? 'bg-[#1a1a1a] border-[#404040]' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Sparkles className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder="Describe what you want to create... (e.g., Create a slideshow with fade transitions)"
                className={`w-full pl-11 pr-12 py-3.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isDarkMode
                    ? 'bg-[#2a2a2a] border-[#404040] text-gray-200 placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                onClick={handleSendPrompt}
                disabled={!prompt.trim() || isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Video Player */}
        <div 
          className={`w-1/2 flex items-center justify-center p-6 relative ${
            isDarkMode ? 'bg-black' : 'bg-gray-100'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className={`relative w-full h-full max-w-6xl max-h-[calc(100vh-400px)] rounded-xl overflow-hidden shadow-lg ${
            isDarkMode ? 'bg-black' : 'bg-white'
          }`}>
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain bg-gray-900"
                onTimeUpdate={handleTimeUpdate}
                controls
              />
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-black' 
                  : 'bg-gray-50'
              }`}>
                <div className="text-center px-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10' 
                      : 'bg-gradient-to-br from-purple-50 to-blue-50'
                  }`}>
                    <Film className={`w-10 h-10 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-500'
                    }`} />
                  </div>
                  <p className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>No video loaded</p>
                  <p className={`text-sm max-w-xs mx-auto ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>Add files and describe what you want to create</p>
                </div>
              </div>
            )}

            {/* Overlay Controls */}
            {showControls && videoUrl && (
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-lg shadow transition-colors"
                  title="Download video"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
