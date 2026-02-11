import { useState } from 'react';
import { Sparkles, Github, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { MediaGallery } from './components/MediaGallery';
import { VideoPlayer } from './components/VideoPlayer';
import { OutputDisplay } from './components/OutputDisplay';
import { Examples } from './components/Examples';
import { ConnectionStatus } from './components/ConnectionStatus';
import { apiService } from './services/api';
import { MediaFile } from './types';

function App() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [command, setCommand] = useState<string | null>(null);
  
  // Parameters
  const [showParams, setShowParams] = useState(false);
  const [temperature, setTemperature] = useState(0.1);
  const [topP, setTopP] = useState(0.95);

  const handleRun = async () => {
    if (!prompt.trim()) {
      alert('Please enter instructions');
      return;
    }

    if (files.length === 0) {
      alert('Please upload at least one media file');
      return;
    }

    setIsLoading(true);
    setVideoUrl(null);
    setOutput('');
    setCommand(null);

    try {
      setOutput('🤖 Analyzing your request...\n');
      
      const response = await apiService.processVideo({
        files: files.map(f => f.file),
        prompt,
        temperature,
        top_p: topP,
      });

      // Create URL for video blob
      const videoObjectUrl = URL.createObjectURL(response.video);
      setVideoUrl(videoObjectUrl);
      setCommand(response.command);
      setOutput(response.aiResponse || 'Video generated successfully!');

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setOutput(`❌ Error: ${errorMessage}\n\nPlease check:\n- Backend is running\n- Files are valid\n- FFmpeg is installed`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => {
    setFiles([]);
    setPrompt('');
    setVideoUrl(null);
    setOutput('');
    setCommand(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏞</span>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  FFmpeg AI Composer
                </h1>
              </div>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description */}
        <div className="card mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Natural Language Video Editing</h2>
              <p className="text-gray-700 leading-relaxed">
                Upload your media files and describe what you want in plain English. 
                Our AI (powered by Google Gemini) will generate the perfect FFmpeg command 
                and create your video instantly. No coding required!
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <ConnectionStatus />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <MediaGallery 
              files={files} 
              onFilesChange={setFiles}
              disabled={isLoading}
            />

            <div className="card">
              <label className="block text-lg font-semibold mb-3">
                Instructions
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a slideshow from these images with 3 seconds per image and smooth fade transitions"
                className="input-field resize-none"
                rows={5}
                disabled={isLoading}
              />
              
              {/* Advanced Parameters */}
              <div className="mt-4">
                <button
                  onClick={() => setShowParams(!showParams)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4" />
                  Advanced Parameters
                  {showParams ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showParams && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <label className="label text-sm">
                        Temperature: {temperature.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Lower = more focused, Higher = more creative
                      </p>
                    </div>

                    <div>
                      <label className="label text-sm">
                        Top P: {topP.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={topP}
                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                        className="w-full"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Nucleus sampling threshold
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRun}
                disabled={isLoading || files.length === 0 || !prompt.trim()}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate Video
                  </span>
                )}
              </button>
              
              {(files.length > 0 || prompt || videoUrl) && (
                <button
                  onClick={clearAll}
                  disabled={isLoading}
                  className="btn-secondary"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Examples */}
            <Examples 
              onSelectExample={handleSelectExample}
              disabled={isLoading}
            />
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <VideoPlayer 
              videoUrl={videoUrl} 
              isLoading={isLoading}
            />
            
            <OutputDisplay 
              output={output}
              command={command}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 card">
          <h2 className="text-xl font-bold mb-4">✨ What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📸', title: 'Slideshows', desc: 'Combine images into videos' },
              { icon: '🌊', title: 'Waveforms', desc: 'Visualize audio files' },
              { icon: '🎬', title: 'Merge Videos', desc: 'Concatenate clips' },
              { icon: '⚡', title: 'Speed Control', desc: 'Adjust playback speed' },
              { icon: '🎵', title: 'Add Music', desc: 'Background audio tracks' },
              { icon: '📱', title: 'Format Convert', desc: 'Portrait, landscape, square' },
              { icon: '✂️', title: 'Trim & Cut', desc: 'Remove sections' },
              { icon: '🎨', title: 'Effects', desc: 'Filters and transitions' },
              { icon: '🔄', title: 'Loop', desc: 'Repeat content' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Built with ❤️ using React, FastAPI, and Google Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
