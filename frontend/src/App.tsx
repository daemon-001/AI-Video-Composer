import { useState } from 'react';
import { Settings, MoreHorizontal, Sun, Moon } from 'lucide-react';
import { EditorSidebar } from './components/EditorSidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ProcessViewer } from './components/ProcessViewer';
import { apiService } from './services/api';
import ClickSpark from './components/ClickSpark';

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
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Handler to add asset to selected assets (Compose grid)
  const handleAddAssetToCreate = (asset: MediaAsset) => {
    // Add to Compose section if not already there
    setSelectedAssets(prevSelected => {
      const isAlreadySelected = prevSelected.some(a => a.id === asset.id);
      if (!isAlreadySelected) {
        return [...prevSelected, asset];
      }
      return prevSelected;
    });
    
    // Also add to Library section if not already there
    setAssets(prevAssets => {
      const isInImport = prevAssets.some(a => a.id === asset.id);
      if (!isInImport) {
        return [...prevAssets, asset];
      }
      return prevAssets;
    });
  };

  // Handler to remove asset from selected assets (Compose grid)
  const handleRemoveAssetFromCreate = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter(a => a.id !== assetId));
  };

  // Handler to clear all assets from Compose grid
  const handleClearAssetsFromCreate = () => {
    setSelectedAssets([]);
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
      setOutput('[WARNING] Please add files to the Compose section first');
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
    <ClickSpark
      sparkColor={isDarkMode ? '#a78bfa' : '#8b5cf6'}
      sparkSize={10}
      sparkRadius={20}
      sparkCount={8}
      duration={500}
    >
    <div className={`h-screen flex flex-col overflow-hidden ${
      isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-50'
    }`}>
      {/* Top Bar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-[#1a1a1a]/95 border-[#404040]' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>Project +</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
              isDarkMode
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a2a]'
                : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <Settings className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Three Sections */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Import (Full Height) */}
        <div className="flex-shrink-0">
          <EditorSidebar
            assets={assets}
            onAssetsChange={setAssets}
            onAddAssetToCreate={handleAddAssetToCreate}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Right Side - Compose, Render, and Process Output */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Middle + Right Section - Compose and Render */}
          <PreviewCanvas
            assets={selectedAssets}
            videoUrl={videoUrl}
            isPlaying={false}
            currentTime={0}
            onTimeUpdate={() => {}}
            onProcess={handleProcess}
            isProcessing={isProcessing}
            onRemoveAsset={handleRemoveAssetFromCreate}
            onAddAsset={handleAddAssetToCreate}
            onClearAssets={handleClearAssetsFromCreate}
            isDarkMode={isDarkMode}
          />

          {/* Bottom Section - Process Output (Under Compose + Render) */}
          <ProcessViewer
            output={output}
            command={command}
            isProcessing={isProcessing}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
    </ClickSpark>
  );
}

export default App;
