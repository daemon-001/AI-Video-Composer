import { Terminal, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface OutputDisplayProps {
  output: string;
  command: string | null;
}

export const OutputDisplay = ({ output, command }: OutputDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    if (command) {
      navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!output && !command) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-primary-600" />
        Processing Output
      </h3>

      {/* AI Response */}
      {output && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">AI Analysis</p>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {output}
            </pre>
          </div>
        </div>
      )}

      {/* FFmpeg Command */}
      {command && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Generated Command</p>
            <button
              onClick={copyCommand}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-green-400 font-mono">
              {command}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};
