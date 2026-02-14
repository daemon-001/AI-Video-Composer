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
  const [output, setOutput] = useState('[READY] Ready to process your media');
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

  // Helper function to add output with delay
  const addOutputWithDelay = (message: string, delay: number = 1000): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setOutput((prev) => prev + message);
        resolve();
      }, delay);
    });
  };

  // Process video with backend API
  const handleProcess = async (prompt: string) => {
    if (selectedAssets.length === 0) {
      setOutput('[WARNING] Please add files to the Create grid first');
      return;
    }

    if (!prompt.trim()) {
      setOutput('[WARNING] Please enter a prompt describing what you want to create');
      return;
    }

    setIsProcessing(true);
    setOutput('[INFO] Starting FFmpeg processing...\n');
    setCommand(null);
    setVideoUrl(null);

    try {
      // Extract files from selected assets
      const files = selectedAssets.map(asset => asset.file);

      await addOutputWithDelay('[OK] Uploading files...\n');
      await addOutputWithDelay('[OK] Analyzing media files...\n');
      await addOutputWithDelay('[OK] Generating FFmpeg command with AI...\n');

      // Call backend API
      const response = await apiService.processVideo({
        files,
        prompt,
        temperature: 0.1,
        top_p: 0.95,
      });

      setCommand(response.command);
      await addOutputWithDelay('[OK] Generated command\n');
      await addOutputWithDelay('[OK] Processing video...\n');

      // Create video URL from blob
      const videoBlob = new Blob([response.video], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

      await addOutputWithDelay('[SUCCESS] Video generated successfully!\n');
    } catch (error: any) {
      console.error('Processing error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error occurred';
      setOutput((prev) => prev + `[ERROR] Error: ${errorMsg}\n`);
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
