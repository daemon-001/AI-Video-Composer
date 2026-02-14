import { useState } from 'react';
import { EditorSidebar } from './components/EditorSidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ProcessViewer } from './components/ProcessViewer';
import { apiService } from './services/api';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  thumbnail: string;
  file: File;
}

function App() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('💡 Ready to process your media');
  const [command, setCommand] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Handler to add asset to selected assets (Create grid)
  const handleAddAssetToCreate = (asset: MediaAsset) => {
    // Check if asset is already in selected assets
    const isAlreadySelected = selectedAssets.some(a => a.id === asset.id);
    if (!isAlreadySelected) {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  // Handler to remove asset from selected assets (Create grid)
  const handleRemoveAssetFromCreate = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter(a => a.id !== assetId));
  };

  // Process video with backend API
  const handleProcess = async (prompt: string) => {
    if (selectedAssets.length === 0) {
      setOutput('⚠️ Please add files to the Create grid first');
      return;
    }

    if (!prompt.trim()) {
      setOutput('⚠️ Please enter a prompt describing what you want to create');
      return;
    }

    setIsProcessing(true);
    setOutput('🤖 Starting FFmpeg processing...\n');
    setCommand(null);
    setVideoUrl(null);

    try {
      // Extract files from selected assets
      const files = selectedAssets.map(asset => asset.file);

      setOutput((prev) => prev + '✓ Uploading files...\n');
      setOutput((prev) => prev + '✓ Analyzing media files...\n');
      setOutput((prev) => prev + '✓ Generating FFmpeg command with AI...\n');

      // Call backend API
      const response = await apiService.processVideo({
        files,
        prompt,
        temperature: 0.1,
        top_p: 0.95,
      });

      setCommand(response.command);
      setOutput((prev) => prev + `✓ Generated command\n`);
      setOutput((prev) => prev + '✓ Processing video...\n');

      // Create video URL from blob
      const videoBlob = new Blob([response.video], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

      setOutput((prev) => prev + '✅ Video generated successfully!\n');
    } catch (error: any) {
      console.error('Processing error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error occurred';
      setOutput((prev) => prev + `❌ Error: ${errorMsg}\n`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar - Full Height */}
      <EditorSidebar
        assets={assets}
        onAssetsChange={setAssets}
        onAddAssetToCreate={handleAddAssetToCreate}
      />

      {/* Right Side - Preview + Process Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview Area */}
        <PreviewCanvas
          assets={selectedAssets}
          videoUrl={videoUrl}
          isPlaying={false}
          currentTime={0}
          onTimeUpdate={() => {}}
          onProcess={handleProcess}
          isProcessing={isProcessing}
          onRemoveAsset={handleRemoveAssetFromCreate}
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
