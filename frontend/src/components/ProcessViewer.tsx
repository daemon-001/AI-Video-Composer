import { Terminal, Command, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProcessViewerProps {
  output: string;
  command?: string | null;
  isProcessing: boolean;
}

export const ProcessViewer = ({ output, command, isProcessing }: ProcessViewerProps) => {
  const [activeTab, setActiveTab] = useState<'output' | 'command'>('output');

  return (
    <div className="bg-white border-t border-gray-200 flex flex-col" style={{ height: '250px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          <span className="text-gray-900 font-medium text-sm">Process Output</span>
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
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Command
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {activeTab === 'output' ? (
          <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap">
            {output ? (
              <div className="space-y-1">
                {output.split('\n').map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {line.startsWith('❌') && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    {line.startsWith('✓') && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    {line.startsWith('🤖') && (
                      <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                    )}
                    <span
                      className={
                        line.startsWith('❌') || line.includes('Error')
                          ? 'text-red-500'
                          : line.startsWith('✓')
                          ? 'text-green-600'
                          : line.startsWith('🤖')
                          ? 'text-blue-600'
                          : ''
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
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
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Command className="w-4 h-4" />
                  <span className="text-xs">Generated FFmpeg Command:</span>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <pre className="text-green-600 whitespace-pre-wrap break-all">{command}</pre>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(command)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
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
