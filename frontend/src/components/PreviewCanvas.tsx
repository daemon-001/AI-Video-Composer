import { useState, useRef, useEffect } from 'react';
import { Send, Video, Music, X, Image as ImageIcon, Film, Sparkles, Download, Trash2, Play, Upload, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' |'video' | 'audio';
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
  onAddAsset?: (asset: MediaAsset) => void;
  onClearAssets?: () => void;
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
  onAddAsset,
  onClearAssets,
  isDarkMode = false,
}: PreviewCanvasProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [importedVideoUrl, setImportedVideoUrl] = useState<string | null>(null);
  const [reloadedVideoUrl, setReloadedVideoUrl] = useState<string | null>(null);

  // Reset imported and reloaded state when video URL changes
  useEffect(() => {
    setImportedVideoUrl(null);
    setReloadedVideoUrl(null);
  }, [videoUrl]);

  // Generate video thumbnail from current video
  const generateThumbnailFromVideo = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not available'));
        return;
      }

      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle download video
  const handleDownloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Handle import to library
  const handleImportToLibrary = async () => {
    if (videoUrl && onAddAsset) {
      // Check if this video has already been imported
      if (importedVideoUrl === videoUrl) {
        console.log('Video already imported to library');
        return;
      }

      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], `rendered-video-${Date.now()}.mp4`, { type: 'video/mp4' });
        
        // Generate thumbnail from video element
        let thumbnail = videoUrl;
        try {
          thumbnail = await generateThumbnailFromVideo();
        } catch (error) {
          console.warn('Failed to generate thumbnail, using video URL:', error);
        }
        
        const asset: MediaAsset = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'video',
          thumbnail: thumbnail,
          file: file,
        };
        
        onAddAsset(asset);
        setImportedVideoUrl(videoUrl); // Mark this video as imported
      } catch (error) {
        console.error('Failed to import video to library:', error);
      }
    }
  };

  // Handle reload to compose
  const handleReloadToCompose = async () => {
    if (videoUrl && onAddAsset && onClearAssets) {
      // Check if this video has already been reloaded
      if (reloadedVideoUrl === videoUrl) {
        console.log('Video already reloaded to compose');
        return;
      }

      try {
        onClearAssets();
        
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], `rendered-video-${Date.now()}.mp4`, { type: 'video/mp4' });
        
        // Generate thumbnail from video element
        let thumbnail = videoUrl;
        try {
          thumbnail = await generateThumbnailFromVideo();
        } catch (error) {
          console.warn('Failed to generate thumbnail, using video URL:', error);
        }
        
        const asset: MediaAsset = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'video',
          thumbnail: thumbnail,
          file: file,
        };
        
        onAddAsset(asset);
        setReloadedVideoUrl(videoUrl); // Mark this video as reloaded
      } catch (error) {
        console.error('Failed to reload video to compose:', error);
      }
    }
  };

  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image';
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create thumbnail blob'));
          }
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg', 0.8);
      };

      video.onerror = () => {
        reject(new Error('Failed to load video'));
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!onAddAsset) return;

    for (const file of acceptedFiles) {
      const type = getFileType(file);
      let thumbnail = '';

      if (type === 'video') {
        try {
          thumbnail = await generateVideoThumbnail(file);
        } catch (error) {
          console.error('Failed to generate video thumbnail:', error);
          thumbnail = '';
        }
      } else {
        thumbnail = URL.createObjectURL(file);
      }

      onAddAsset({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type,
        thumbnail,
        file,
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
    },
    noClick: true,
  });

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
    }
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className={`flex-1 flex overflow-hidden gap-3 p-3 ${
      isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-50'
    }`}>
      {/* Middle Section - Compose */}
      <div className={`w-1/2 flex flex-col rounded-xl overflow-hidden ${
        isDarkMode 
          ? 'bg-[#1a1a1a] border border-[#404040] shadow-xl shadow-black/20' 
          : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        {/* Section Header */}
        <div className={`px-4 py-3 border-b ${
          isDarkMode ? 'border-[#404040]' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between h-6">
            <div className="flex items-center gap-2">
              <Film className={`w-4 h-4 ${
                isDarkMode 
                  ? 'text-purple-400' 
                  : 'text-purple-600'
              }`} />
              <h3 className={`text-sm font-semibold tracking-wide ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Compose</h3>
            </div>
            {/* Always render button space to prevent layout shift */}
            <button
              onClick={() => onClearAssets?.()}
              className={`p-2 rounded-lg transition-all ${
                assets.length > 0
                  ? isDarkMode
                    ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400 hover:scale-105 active:scale-95'
                    : 'hover:bg-red-50 text-gray-500 hover:text-red-600 hover:scale-105 active:scale-95'
                  : 'invisible'
              }`}
              title="Clear all files"
              disabled={assets.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Grid */}
        <div 
          {...getRootProps()}
          className={`flex-1 overflow-y-auto p-4 ${!isDarkMode ? 'light-scrollbar' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="grid grid-cols-4 gap-3">
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
                  title="Remove"
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
                  
                  {/* File Type Badge */}
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
                  isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'
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
                }`}>Add files from Library</p>
              </div>
            )}
          </div>
        </div>

        {/* Prompt Input Section */}
        <div className={`border-t p-4 ${
          isDarkMode 
            ? 'bg-[#1a1a1a] border-[#404040]' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
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
                placeholder="Describe what you want to create..."
                className={`w-full pl-11 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isDarkMode
                    ? 'bg-[#2a2a2a] border-[#404040] text-gray-200 placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <button
              onClick={handleSendPrompt}
              disabled={!prompt.trim() || isProcessing}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm">Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Render */}
      <div className={`w-1/2 flex flex-col rounded-xl overflow-hidden ${
        isDarkMode 
          ? 'bg-[#1a1a1a] border border-[#404040] shadow-xl shadow-black/20' 
          : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        {/* Section Header */}
        <div className={`px-4 py-3 border-b ${
          isDarkMode ? 'border-[#404040]' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between h-6">
            <div className="flex items-center gap-2">
              <Play className={`w-4 h-4 ${
                isDarkMode 
                  ? 'text-green-400' 
                  : 'text-green-600'
              }`} />
              <h3 className={`text-sm font-semibold tracking-wide ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Render</h3>
            </div>
            
            {/* Action Buttons */}
            {videoUrl ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleImportToLibrary}
                  className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? 'hover:bg-blue-500/10 text-gray-400 hover:text-blue-400'
                      : 'hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                  }`}
                  title="Import to Library"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadVideo}
                  className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? 'hover:bg-green-500/10 text-gray-400 hover:text-green-400'
                      : 'hover:bg-green-50 text-gray-500 hover:text-green-600'
                  }`}
                  title="Download Video"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReloadToCompose}
                  className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? 'hover:bg-purple-500/10 text-gray-400 hover:text-purple-400'
                      : 'hover:bg-purple-50 text-gray-500 hover:text-purple-600'
                  }`}
                  title="Reload to Compose"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div 
          className="flex-1 flex items-center justify-center"
        >
          {videoUrl ? (
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-[calc(100vh-250px)] w-auto block bg-black"
                onTimeUpdate={handleTimeUpdate}
                controls
              />
            </div>
          ) : (
            <div className={`w-full h-full rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-50'
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
        </div>
      </div>
    </div>
  );
};
