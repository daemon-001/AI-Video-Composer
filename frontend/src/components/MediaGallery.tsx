import { useState, useCallback } from 'react';
import { Upload, X, FileVideo, FileImage, Music, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { MediaFile, MAX_FILE_SIZE, MAX_FILES, FILE_TYPES } from '../types';

interface MediaGalleryProps {
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  disabled?: boolean;
}

export const MediaGallery = ({ files, onFilesChange, disabled }: MediaGalleryProps) => {
  const [error, setError] = useState<string | null>(null);

  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (FILE_TYPES.image.includes(ext)) return 'image';
    if (FILE_TYPES.video.includes(ext)) return 'video';
    if (FILE_TYPES.audio.includes(ext)) return 'audio';
    
    return 'image'; // default
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    // Check file count
    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Validate and process files
    const newFiles: MediaFile[] = [];
    
    for (const file of acceptedFiles) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds 10MB limit`);
        continue;
      }

      const type = getFileType(file);
      const preview = URL.createObjectURL(file);
      
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        type,
      });
    }

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': FILE_TYPES.image,
      'video/*': FILE_TYPES.video,
      'audio/*': FILE_TYPES.audio,
    },
    disabled,
  });

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFilesChange(files.filter(f => f.id !== id));
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    onFilesChange([]);
    setError(null);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideo className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'image': return <FileImage className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Media Files</h2>
        {files.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            disabled={disabled}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
        <p className="text-gray-700 font-medium mb-2">
          {isDragActive ? 'Drop files here...' : 'Drag & drop media files'}
        </p>
        <p className="text-sm text-gray-500">
          or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Images, videos, audio • Max 10MB per file • Up to {MAX_FILES} files
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Files ({files.length}/{MAX_FILES})
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((mediaFile) => (
              <div
                key={mediaFile.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group hover:bg-gray-100 transition-colors"
              >
                {/* Preview */}
                <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                  {mediaFile.type === 'image' ? (
                    <img
                      src={mediaFile.preview}
                      alt={mediaFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500">
                      {getFileIcon(mediaFile.type)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {mediaFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(mediaFile.file.size)} • {mediaFile.type}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(mediaFile.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  disabled={disabled}
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
