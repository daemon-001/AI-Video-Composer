import { Terminal, Command, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ProcessViewerProps {
  output: string;
  currentPhase: string;
  command?: string | null;
  isProcessing: boolean;
  isDarkMode?: boolean;
}

export const ProcessViewer = ({ output, currentPhase, command, isProcessing, isDarkMode = false }: ProcessViewerProps) => {
  const [activeTab, setActiveTab] = useState<'output' | 'command'>('output');
  const isCompleted = currentPhase.includes('successfully') || currentPhase.includes('Generated command');
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (activeTab === 'output' && outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, activeTab]);

  return (
    <div className={`border-t flex flex-col ${
      isDarkMode 
        ? 'bg-[#1a1a1a] border-[#404040]' 
        : 'bg-white border-gray-200'
    }`} style={{ height: '250px' }}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDarkMode 
          ? 'bg-[#0f0f0f] border-[#404040]' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          <span className={`font-medium text-sm ${
            isDarkMode ? 'text-gray-200' : 'text-gray-900'
          }`}>Process Output</span>
          {isProcessing && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-2" />
          )}
          {!isProcessing && isCompleted && (
            <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
          )}
          <span className={`text-sm ml-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>{currentPhase}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'output'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Output
          </button>
          <button
            onClick={() => setActiveTab('command')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'command'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Command
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto p-4 ${
        isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-50'
      } ${!isDarkMode ? 'light-scrollbar' : ''}`}>
        {activeTab === 'output' ? (
          <div className={`font-mono text-sm whitespace-pre-wrap ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {output ? (
              <div className="space-y-1">
                {output.split('\n').map((line, idx) => (
                  <div 
                    key={idx}
                    className={
                      line.includes('[ERROR]')
                        ? 'text-red-500'
                        : line.includes('[OK]') || line.includes('[SUCCESS]')
                        ? 'text-green-500'
                        : line.includes('[INFO]')
                        ? 'text-blue-500'
                        : line.includes('[WARNING]')
                        ? 'text-yellow-500'
                        : ''
                    }
                  >
                    {line}
                  </div>
                ))}
                <div ref={outputEndRef} />
              </div>
            ) : (
              <div className={`flex items-center justify-center h-full ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <div className="text-center">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No output yet</p>
                  <p className="text-xs mt-1">Process output will appear here</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="font-mono text-sm">
            {command ? (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Command className="w-4 h-4" />
                  <span className="text-xs">Generated FFmpeg Command:</span>
                </div>
                <div className={`rounded-lg p-3 border relative ${
                  isDarkMode 
                    ? 'bg-[#2a2a2a] border-[#404040]' 
                    : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={() => navigator.clipboard.writeText(command)}
                    className={`absolute top-2 right-2 px-2 py-1 text-xs rounded transition-colors ${
                      isDarkMode
                        ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                  <pre className="text-green-600 whitespace-pre-wrap break-all pr-16">{command}</pre>
                </div>
              </div>
            ) : (
              <div className={`flex items-center justify-center h-full ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <div className="text-center">
                  <Command className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No command generated</p>
                  <p className="text-xs mt-1">FFmpeg command will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
