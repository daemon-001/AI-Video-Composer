import { useState, useRef } from 'react';
import { Upload, Video, Music, X, Grid3x3, Image as ImageIcon, Plus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  thumbnail: string;
  file: File;
}

interface EditorSidebarProps {
  assets: MediaAsset[];
  onAssetsChange: (assets: MediaAsset[]) => void;
  onAddAssetToCreate?: (asset: MediaAsset) => void;
  isDarkMode?: boolean;
}

type MediaFilter = 'all' | 'video' | 'audio' | 'image';

export const EditorSidebar = ({ assets, onAssetsChange, onAddAssetToCreate, isDarkMode = false }: EditorSidebarProps) => {
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image';
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      
      video.onloadeddata = () => {
        // Seek to 1 second or 10% of video duration, whichever is smaller
        video.currentTime = Math.min(1, video.duration * 0.1);
      };
      
      video.onseeked = () => {
        try {
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
        } finally {
          URL.revokeObjectURL(video.src);
        }
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
        URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const newAssets: MediaAsset[] = [];
    
    for (const file of acceptedFiles) {
      const type = getFileType(file);
      let thumbnail = '';
      
      if (type === 'video') {
        try {
          thumbnail = await generateVideoThumbnail(file);
        } catch (error) {
          console.error('Failed to generate video thumbnail:', error);
          thumbnail = ''; // Will show placeholder
        }
      } else {
        thumbnail = URL.createObjectURL(file);
      }
      
      newAssets.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type,
        thumbnail,
        file,
      });
    }
    
    onAssetsChange([...assets, ...newAssets]);
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

  const removeAsset = (id: string) => {
    onAssetsChange(assets.filter((a) => a.id !== id));
  };

  const filterItems = [
    { id: 'all' as MediaFilter, icon: Grid3x3, label: 'All' },
    { id: 'video' as MediaFilter, icon: Video, label: 'Video' },
    { id: 'audio' as MediaFilter, icon: Music, label: 'Audio' },
    { id: 'image' as MediaFilter, icon: ImageIcon, label: 'Image' },
  ];

  // Filter assets based on active filter
  const filteredAssets = activeFilter === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === activeFilter);

  return (
    <div className={`flex h-full border-r ${
      isDarkMode ? 'border-[#404040]' : 'border-gray-200'
    }`}>
      {/* Left Vertical Menu */}
      <div className={`w-20 border-r flex flex-col items-center py-4 px-2 gap-1 ${
        isDarkMode 
          ? 'bg-[#1a1a1a] border-[#404040]' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Menu Items */}
        {filterItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`w-full aspect-square flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-all ${
                isActive
                  ? isDarkMode
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 shadow-lg'
                    : 'bg-gradient-to-br from-purple-50 to-blue-50 text-purple-600 shadow-md'
                  : isDarkMode
                  ? 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isActive 
                  ? isDarkMode ? 'text-purple-400' : 'text-purple-600' 
                  : ''
              }`} />
              <span className="text-xs text-center leading-tight font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Content Panel */}
      <div className={`w-80 flex flex-col h-full p-3 ${
        isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-50'
      }`}>
        {/* Library Card */}
        <div className={`flex flex-col h-full rounded-xl overflow-hidden ${
          isDarkMode 
            ? 'bg-[#1a1a1a] border border-[#404040] shadow-xl shadow-black/20' 
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          {/* Import Header */}
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'border-[#404040]' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between h-6">
              <div className="flex items-center gap-2">
                <Upload className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Library</h3>
              </div>
              {/* Spacer to match button in Compose section */}
              <div className="w-8 h-8"></div>
            </div>
          </div>

          {/* Content Area - Assets Grid */}
          {/* Assets Grid */}
          <div 
            {...getRootProps()}
            className={`flex-1 overflow-y-auto p-3 ${!isDarkMode ? 'light-scrollbar' : ''}`}
          >
          <input {...getInputProps()} ref={fileInputRef} />
          <div className="grid grid-cols-2 gap-2">
            {/* Add File Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-lg transition-all group overflow-hidden aspect-[4/3] flex items-center justify-center ${
                isDarkMode
                  ? 'bg-[#2a2a2a] border-[#404040] hover:border-blue-500 hover:bg-[#2f2f3f]'
                  : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {/* Centered Upload Icon and Text */}
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-xl mb-2 transition-colors ${
                  isDarkMode
                    ? 'bg-[#1a1a1a] group-hover:bg-blue-500/10'
                    : 'bg-gray-50 group-hover:bg-blue-100'
                }`}>
                  <Upload className={`w-6 h-6 transition-colors ${
                    isDarkMode
                      ? 'text-gray-500 group-hover:text-blue-400'
                      : 'text-gray-400 group-hover:text-blue-500'
                  }`} />
                </div>
                <p className={`text-xs font-medium transition-colors ${
                  isDarkMode
                    ? 'text-gray-500 group-hover:text-blue-400'
                    : 'text-gray-400 group-hover:text-blue-500'
                }`}>Add File</p>
              </div>
            </div>

            {/* Filtered Assets */}
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(asset));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className={`relative group cursor-move rounded-lg overflow-hidden transition-all ${
                  isDarkMode 
                    ? 'bg-[#2a2a2a] hover:bg-[#323232] ring-1 ring-[#404040] hover:ring-blue-500/50' 
                    : 'bg-white hover:shadow-lg ring-1 ring-gray-200 hover:ring-blue-400/50'
                }`}
              >
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
                  <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-md px-2 py-1 flex items-center gap-1.5 z-10">
                    {asset.type === 'video' && <Video className="w-3 h-3 text-white" />}
                    {asset.type === 'audio' && <Music className="w-3 h-3 text-white" />}
                    {asset.type === 'image' && <ImageIcon className="w-3 h-3 text-white" />}
                  </div>
                  
                  {/* Hover Overlay with Centered Plus Icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button
                      className="bg-white/60 hover:bg-white/70 text-gray-800 rounded-full p-3 shadow-xl transition-all transform scale-90 group-hover:scale-100 hover:scale-110 active:scale-95 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddAssetToCreate) {
                          onAddAssetToCreate(asset);
                        }
                      }}
                      title="Add to Compose"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeAsset(asset.id)}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600/90 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10 hover:scale-110 active:scale-95 backdrop-blur-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
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

            {filteredAssets.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${
                  isDarkMode 
                    ? 'bg-[#2a2a2a]' 
                    : 'bg-gray-100'
                }`}>
                  {activeFilter === 'video' && <Video className={`w-7 h-7 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />}
                  {activeFilter === 'audio' && <Music className={`w-7 h-7 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />}
                  {activeFilter === 'image' && <ImageIcon className={`w-7 h-7 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />}
                  {activeFilter === 'all' && <Upload className={`w-7 h-7 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />}
                </div>
                <p className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {activeFilter === 'all' 
                    ? 'Click "Add File" to get started' 
                    : `No ${activeFilter} files found`}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
