export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'audio';
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: 'idle' | 'uploading' | 'generating' | 'processing' | 'complete' | 'error';
  message: string;
}

export interface AppState {
  files: MediaFile[];
  prompt: string;
  videoUrl: string | null;
  output: string;
  command: string | null;
  processingState: ProcessingState;
}

export const EXAMPLE_PROMPTS = [
  {
    id: 'slideshow',
    title: '📸 Create Slideshow',
    description: 'Combine images into a video',
    prompt: 'Create a slideshow from these images, 3 seconds per image, with smooth fade transitions',
  },
  {
    id: 'waveform',
    title: '🌊 Audio Waveform',
    description: 'Visualize audio as video',
    prompt: 'Create a video with an animated waveform visualization of this audio file',
  },
  {
    id: 'merge',
    title: '🎬 Merge Videos',
    description: 'Concatenate video clips',
    prompt: 'Merge these video clips into a single video with smooth transitions',
  },
  {
    id: 'speed',
    title: '⚡ Adjust Speed',
    description: 'Speed up or slow down',
    prompt: 'Speed up this video to 2x normal speed',
  },
  {
    id: 'music',
    title: '🎵 Add Background Music',
    description: 'Combine video with audio',
    prompt: 'Add this audio as background music to the video, looping if necessary',
  },
  {
    id: 'vertical',
    title: '📱 Vertical Format',
    description: 'Convert to portrait mode',
    prompt: 'Convert these images to a vertical 9:16 TikTok-style slideshow, 2 seconds per image',
  },
];

export const FILE_TYPES = {
  image: ['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.bmp', '.gif', '.svg'],
  video: ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.mpg', '.mpeg', '.m4v'],
  audio: ['.mp3', '.wav', '.ogg'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES = 20;
