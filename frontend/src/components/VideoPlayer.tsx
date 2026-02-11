import { Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string | null;
  isLoading: boolean;
}

export const VideoPlayer = ({ videoUrl, isLoading }: VideoPlayerProps) => {
  if (!videoUrl && !isLoading) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Play className="w-5 h-5 text-primary-600" />
        Generated Video
      </h3>

      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white text-sm">Processing video...</p>
            </div>
          </div>
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            autoPlay
            loop
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No video generated yet</p>
            </div>
          </div>
        )}
      </div>

      {videoUrl && !isLoading && (
        <div className="mt-4 flex gap-2">
          <a
            href={videoUrl}
            download="output.mp4"
            className="btn-primary flex-1 text-center"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
};
