import { useState } from 'react';
import { EditorSidebar } from './components/EditorSidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ProcessViewer } from './components/ProcessViewer';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  thumbnail: string;
  file: File;
}



// Sample placeholder images (mountain/landscape scenes)
const createPlaceholderImage = (text: string, gradient: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    if (gradient === 'blue') {
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#1e40af');
    } else if (gradient === 'purple') {
      grad.addColorStop(0, '#8b5cf6');
      grad.addColorStop(1, '#6d28d9');
    } else if (gradient === 'green') {
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, '#059669');
    } else {
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#d97706');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 200, 150);
  }
  return canvas.toDataURL();
};

function App() {
  // Initialize with sample landscape images
  const [assets, setAssets] = useState<MediaAsset[]>([
    {
      id: '1',
      name: 'MOV51012',
      type: 'video',
      thumbnail: createPlaceholderImage('🏔️ Mountain', 'blue'),
      file: new File([], 'MOV51012.mp4'),
    },
    {
      id: '2',
      name: 'MOV51013',
      type: 'image',
      thumbnail: createPlaceholderImage('🌊 Ocean', 'blue'),
      file: new File([], 'MOV51013.jpg'),
    },
    {
      id: '3',
      name: 'MOV51438',
      type: 'image',
      thumbnail: createPlaceholderImage('🏞️ Lake', 'green'),
      file: new File([], 'MOV51438.jpg'),
    },
    {
      id: '4',
      name: 'MOV51019',
      type: 'image',
      thumbnail: createPlaceholderImage('🌄 Sunset', 'purple'),
      file: new File([], 'MOV51019.jpg'),
    },
    {
      id: '5',
      name: 'MOV51042',
      type: 'image',
      thumbnail: createPlaceholderImage('🏖️ Beach', 'blue'),
      file: new File([], 'MOV51042.jpg'),
    },
    {
      id: '6',
      name: 'MOV51012',
      type: 'video',
      thumbnail: createPlaceholderImage('🎥 Video', 'purple'),
      file: new File([], 'MOV51012.mp4'),
    },
    {
      id: '7',
      name: 'MOV51010',
      type: 'image',
      thumbnail: createPlaceholderImage('⛰️ Peak', 'blue'),
      file: new File([], 'MOV51010.jpg'),
    },
    {
      id: '8',
      name: 'MOV61016',
      type: 'image',
      thumbnail: createPlaceholderImage('🌅 Dawn', 'orange'),
      file: new File([], 'MOV61016.jpg'),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('💡 Ready to process your media');
  const [command, setCommand] = useState<string | null>(null);
  
  // Set initial preview frame with mountain image
  const [currentFrame] = useState(createPlaceholderImage('🏔️ Mountain Peak', 'blue'));
  const [videoUrl] = useState<string | null>(null);

  // Example: Simulate processing
  const handleProcess = async () => {
    setIsProcessing(true);
    setOutput('🤖 Starting FFmpeg processing...\n');
    setCommand(null);

    // Simulate processing steps
    setTimeout(() => {
      setOutput((prev) => prev + '✓ Analyzing media files...\n');
    }, 500);

    setTimeout(() => {
      setOutput((prev) => prev + '✓ Generating FFmpeg command...\n');
      setCommand('ffmpeg -loop 1 -i input.jpg -i audio.mp3 -c:v libx264 -c:a aac -b:a 192k -shortest output.mp4');
    }, 1000);

    setTimeout(() => {
      setOutput((prev) => prev + '✓ Processing video...\n✓ Video generated successfully!\n');
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar - Full Height */}
      <EditorSidebar
        assets={assets}
        onAssetsChange={setAssets}
      />

      {/* Right Side - Preview + Process Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview Area */}
        <PreviewCanvas
          assets={assets}
          currentFrame={currentFrame}
          videoUrl={videoUrl}
          isPlaying={false}
          currentTime={0}
          onTimeUpdate={() => {}}
          onProcess={handleProcess}
          isProcessing={isProcessing}
        />

        {/* Process Viewer */}
        <ProcessViewer
          output={output}
          command={command}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

export default App;
