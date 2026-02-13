import { useState } from 'react';
import { Play, Pause, Scissors, Trash2, Volume2 } from 'lucide-react';

interface TimelineClip {
  id: string;
  type: 'video' | 'image' | 'audio' | 'text';
  name: string;
  startTime: number;
  duration: number;
  track: number;
  thumbnail?: string;
  content?: string;
}

interface TimelineProps {
  clips: TimelineClip[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayPause: () => void;
  onClipRemove: (id: string) => void;
}

export const Timeline = ({
  clips,
  currentTime,
  duration,
  isPlaying,
  onTimeChange: _onTimeChange,
  onPlayPause,
  onClipRemove,
}: TimelineProps) => {
  const [zoom, setZoom] = useState(1);
  const pixelsPerSecond = 100 * zoom;
  const totalWidth = Math.max(duration * pixelsPerSecond, 1000);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
  };

  const getClipColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-purple-500 border-purple-600';
      case 'image':
        return 'bg-blue-500 border-blue-600';
      case 'audio':
        return 'bg-green-500 border-green-600';
      case 'text':
        return 'bg-pink-500 border-pink-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const renderTimeMarkers = () => {
    const markers = [];
    const step = 10; // 10 seconds
    for (let i = 0; i <= duration; i += step) {
      markers.push(
        <div
          key={i}
          className="absolute top-0 h-full border-l border-gray-700"
          style={{ left: `${i * pixelsPerSecond}px` }}
        >
          <span className="text-xs text-gray-400 ml-1">{formatTime(i).slice(0, 5)}</span>
        </div>
      );
    }
    return markers;
  };

  const renderClip = (clip: TimelineClip) => {
    const left = clip.startTime * pixelsPerSecond;
    const width = clip.duration * pixelsPerSecond;

    return (
      <div
        key={clip.id}
        className={`absolute h-12 rounded border-2 ${getClipColor(clip.type)} overflow-hidden cursor-move group`}
        style={{
          left: `${left}px`,
          width: `${width}px`,
          top: `${clip.track * 56}px`,
        }}
      >
        {/* Video/Image clips show thumbnails repeated */}
        {clip.thumbnail && (clip.type === 'video' || clip.type === 'image') && (
          <div className="absolute inset-0 flex">
            {[...Array(Math.ceil(width / 80))].map((_, i) => (
              <img
                key={i}
                src={clip.thumbnail}
                alt={clip.name}
                className="h-full w-20 object-cover border-r border-purple-700 opacity-60"
              />
            ))}
          </div>
        )}
        
        {clip.type === 'audio' && (
          <div className="absolute inset-0 flex items-center px-2 gap-0.5">
            {[...Array(Math.floor(width / 4))].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-0.5 bg-white rounded-full opacity-70"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-medium bg-black bg-opacity-20">
          {clip.type === 'text' ? (
            <span className="truncate">📝 {clip.content || clip.name}</span>
          ) : (
            <span className="truncate">{clip.name}</span>
          )}
        </div>

        <button
          onClick={() => onClipRemove(clip.id)}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 rounded p-1"
        >
          <Trash2 className="w-3 h-3 text-white" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 flex flex-col" style={{ height: '280px' }}>
      {/* Controls */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <button
          onClick={onPlayPause}
          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-200 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-gray-900" />
          ) : (
            <Play className="w-5 h-5 text-gray-900 ml-0.5" />
          )}
        </button>

        <div className="text-white font-mono text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
            <Scissors className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
          >
            -
          </button>
          <span className="text-white text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.5))}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
          >
            +
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="relative h-full" style={{ minWidth: `${totalWidth}px` }}>
          {/* Time markers */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800">
            {renderTimeMarkers()}
          </div>

          {/* Tracks */}
          <div className="absolute top-6 left-0 right-0 bottom-0">
            {/* Grid lines */}
            {[0, 1, 2, 3].map((track) => (
              <div
                key={track}
                className="absolute left-0 right-0 h-14 border-b border-gray-800"
                style={{ top: `${track * 56}px` }}
              />
            ))}

            {/* Clips */}
            <div className="relative">
              {clips.map(renderClip)}
            </div>
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
