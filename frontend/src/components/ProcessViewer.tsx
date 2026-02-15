import { Terminal, Command, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProcessViewerProps {
  output: string;
  command?: string | null;
  isProcessing: boolean;
  isDarkMode?: boolean;
}

export const ProcessViewer = ({ output, command, isProcessing, isDarkMode = false }: ProcessViewerProps) => {
  const [activeTab, setActiveTab] = useState<'output' | 'command'>('output');

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
            <div className="flex items-center gap-2 ml-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-blue-600 text-xs">Processing...</span>
            </div>
          )}
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
                    className="flex items-start gap-2 animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {line.startsWith('[ERROR]') && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    {line.startsWith('[OK]') && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    {line.startsWith('[SUCCESS]') && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    {line.startsWith('[INFO]') && isProcessing && (
                      <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                    )}
                    {line.startsWith('[WARNING]') && (
                      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    {line.startsWith('[READY]') && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        line.startsWith('[ERROR]') || line.includes('Error')
                          ? 'text-red-500'
                          : line.startsWith('[OK]') || line.startsWith('[SUCCESS]')
                          ? 'text-green-600'
                          : line.startsWith('[INFO]')
                          ? 'text-blue-600'
                          : line.startsWith('[WARNING]')
                          ? 'text-yellow-600'
                          : line.startsWith('[READY]')
                          ? 'text-blue-600'
                          : ''
                      }
                    >
                      {line.replace(/^\[(OK|SUCCESS|INFO|ERROR|WARNING|READY)\]\s*/, '')}
                    </span>
                  </div>
                ))}
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
                <div className={`rounded-lg p-3 border ${
                  isDarkMode 
                    ? 'bg-[#2a2a2a] border-[#404040]' 
                    : 'bg-white border-gray-200'
                }`}>
                  <pre className="text-green-600 whitespace-pre-wrap break-all">{command}</pre>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(command)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Copy to Clipboard
                </button>
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
