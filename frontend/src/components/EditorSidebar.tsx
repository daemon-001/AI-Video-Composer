import { useState } from 'react';
import { Upload, Video, Music, X, Crop, Trash2, Smartphone, Camera, Plus, Grid3x3, Image as ImageIcon } from 'lucide-react';
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
}

type MediaFilter = 'all' | 'video' | 'audio' | 'image';

export const EditorSidebar = ({ assets, onAssetsChange }: EditorSidebarProps) => {
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');
  const [projectName, setProjectName] = useState('Project');
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('');

  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image';
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newAssets: MediaAsset[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: getFileType(file),
      thumbnail: URL.createObjectURL(file),
      file,
    }));
    onAssetsChange([...assets, ...newAssets]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
    },
  });

  const removeAsset = (id: string) => {
    onAssetsChange(assets.filter((a) => a.id !== id));
  };

  const handleCreateNewProject = () => {
    const name = prompt('Enter new project name:');
    if (name && name.trim()) {
      setProjectName(name.trim());
      // Optionally clear assets for new project
      // onAssetsChange([]);
    }
  };

  const handleRenameProject = () => {
    setTempProjectName(projectName);
    setIsRenamingProject(true);
  };

  const handleProjectNameSave = () => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
    }
    setIsRenamingProject(false);
  };

  const handleProjectNameCancel = () => {
    setTempProjectName('');
    setIsRenamingProject(false);
  };

  const handleProjectNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleProjectNameSave();
    } else if (e.key === 'Escape') {
      handleProjectNameCancel();
    }
  };

  const filterItems = [
    { id: 'all' as MediaFilter, icon: Grid3x3, label: 'All Items' },
    { id: 'video' as MediaFilter, icon: Video, label: 'Video' },
    { id: 'audio' as MediaFilter, icon: Music, label: 'Audio' },
    { id: 'image' as MediaFilter, icon: ImageIcon, label: 'Image' },
  ];

  // Filter assets based on active filter
  const filteredAssets = activeFilter === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === activeFilter);

  return (
    <div className="flex h-full border-r border-gray-200">
      {/* Left Vertical Menu */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Menu Items */}
        {filterItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`w-full flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
              <span className="text-xs text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Content Panel */}
      <div className="w-80 bg-gray-50 flex flex-col h-full">
        {/* Header - Common to all sections */}
        <div className="p-3 border-b border-gray-200 bg-white">
          {/* Project Title */}
          <div className="mb-3 flex items-center gap-2">
            {isRenamingProject ? (
              <input
                type="text"
                value={tempProjectName}
                onChange={(e) => setTempProjectName(e.target.value)}
                onBlur={handleProjectNameSave}
                onKeyDown={handleProjectNameKeyDown}
                autoFocus
                className="flex-1 text-sm font-medium text-gray-900 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <>
                <h3
                  onClick={handleRenameProject}
                  className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  title="Click to rename project"
                >
                  {projectName}
                </h3>
                <button
                  onClick={handleCreateNewProject}
                  className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-blue-600"
                  title="Create new project"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Icon Buttons Row */}
          <div className="flex items-center gap-2">
            <div
              {...getRootProps()}
              className="cursor-pointer"
            >
              <input {...getInputProps()} />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                <Upload className="w-5 h-5" />
              </button>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Smartphone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area - Assets Grid */}
        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {/* Add File Card */}
            <div
              {...getRootProps()}
              className="relative cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <input {...getInputProps()} />
              <div className="aspect-video flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">Add File</p>
              </div>
            </div>

            {/* Filtered Assets */}
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                className="relative group cursor-move bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
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
                  
                  {/* Plus Icon - Permanent */}
                  <button
                    className="absolute bottom-1 right-1 bg-blue-500 hover:bg-blue-600 text-white rounded p-1 shadow-sm transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle add/select action here
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => removeAsset(asset.id)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="px-2 py-1.5">
                  <p className="text-xs text-gray-700 truncate">{asset.name}</p>
                </div>
              </div>
            ))}

            {filteredAssets.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
                <p className="text-xs mt-1">
                  {activeFilter === 'all' 
                    ? 'Click "Add File" to get started' 
                    : `No ${activeFilter} files found`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-gray-200 bg-white px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700">
                <Crop className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-mono text-gray-400">00:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};
