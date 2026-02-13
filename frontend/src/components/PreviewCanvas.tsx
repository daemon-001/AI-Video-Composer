import { useState, useRef, useEffect } from 'react';
import { Maximize2, Download, Settings, MoreHorizontal, Play, Send, Video, Music, X, Image as ImageIcon } from 'lucide-react';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  thumbnail: string;
  file: File;
}

interface PreviewCanvasProps {
  currentFrame?: string;
  videoUrl?: string | null;
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
  onProcess?: () => void;
  isProcessing?: boolean;
  assets?: MediaAsset[];
}

export const PreviewCanvas = ({
  currentFrame,
  videoUrl,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onProcess,
  isProcessing = false,
  assets = [],
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
      onProcess();
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

  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">Project</h3>
        </div>

        <div className="flex items-center gap-2">
          {onProcess && (
            <button
              onClick={onProcess}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Process Video'}
            </button>
          )}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Split into two sections */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - File Grid and Prompt */}
        <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
          {/* Create Title */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Create</h3>
          </div>

          {/* File Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 gap-2">
              {assets.slice(0, 6).map((asset) => (
                <div
                  key={asset.id}
                  className="group relative bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Remove Icon */}
                  <button
                    className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle remove action here
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="aspect-video bg-gray-100 relative">
                    {asset.type === 'audio' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                        <Music className="w-10 h-10 text-white" />
                      </div>
                    ) : (
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* File Type Icon Badge */}
                    <div className="absolute bottom-1 left-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-sm px-1.5 py-1 flex items-center gap-1">
                      {asset.type === 'video' && <Video className="w-3 h-3 text-white" />}
                      {asset.type === 'audio' && <Music className="w-3 h-3 text-white" />}
                      {asset.type === 'image' && <ImageIcon className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-gray-700 truncate">{asset.name}</p>
                  </div>
                </div>
              ))}
              {assets.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-400">
                  <p className="text-sm">No files selected</p>
                  <p className="text-xs mt-1">Add files from the sidebar</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Input Section */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder="Describe what you want to create... (e.g., Create a slideshow with fade transitions)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleSendPrompt}
                disabled={!prompt.trim() || isProcessing}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Video Player */}
        <div 
          className="w-1/2 flex items-center justify-center p-6 bg-gray-100 relative"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[calc(100vh-400px)] bg-white rounded-xl overflow-hidden shadow-lg">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain bg-gray-900"
                onTimeUpdate={handleTimeUpdate}
              />
            ) : currentFrame ? (
              <img
                src={currentFrame}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg font-medium text-gray-600">No media selected</p>
                  <p className="text-sm text-gray-400 mt-2">Add media from the sidebar to start editing</p>
                </div>
              </div>
            )}

            {/* Overlay Controls */}
            {showControls && videoUrl && (
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <button className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-lg shadow transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
        <div>
          {videoUrl ? 'Video loaded' : 'No video loaded'}
        </div>
        <div className="flex items-center gap-4">
          <span>1920 × 1080</span>
          <span>•</span>
          <span>30 FPS</span>
        </div>
      </div>
    </div>
  );
};
