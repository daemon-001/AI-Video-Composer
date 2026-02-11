import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface ConnectionStatusProps {
  onTestConnection?: () => Promise<boolean>;
}

export const ConnectionStatus = ({ onTestConnection }: ConnectionStatusProps) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [details, setDetails] = useState<{ ffmpeg: boolean; gemini: boolean } | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setStatus('checking');
    try {
      const health = await apiService.checkHealth();
      
      setDetails({
        ffmpeg: health.ffmpeg_installed,
        gemini: health.gemini_configured,
      });

      if (health.status === 'healthy') {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus('disconnected');
      setDetails(null);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking backend connection...';
      case 'connected':
        return 'Connected to backend';
      case 'error':
        return 'Backend configuration issue';
      case 'disconnected':
        return 'Cannot connect to backend';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-300 bg-blue-50';
      case 'connected':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-yellow-300 bg-yellow-50';
      case 'disconnected':
        return 'border-red-300 bg-red-50';
    }
  };

  return (
    <div className={`card mb-6 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{getStatusText()}</p>
          
          {details && status !== 'disconnected' && (
            <div className="mt-2 text-sm space-y-1">
              <div className="flex items-center gap-2">
                {details.ffmpeg ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={details.ffmpeg ? 'text-green-700' : 'text-red-700'}>
                  FFmpeg {details.ffmpeg ? 'installed' : 'not installed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {details.gemini ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={details.gemini ? 'text-green-700' : 'text-red-700'}>
                  Gemini API {details.gemini ? 'configured' : 'not configured'}
                </span>
              </div>
            </div>
          )}

          {status === 'disconnected' && (
            <div className="mt-2 text-sm text-red-700">
              <p>Make sure the backend server is running on port 8000.</p>
              <p className="mt-1">Run: <code className="bg-red-100 px-1 py-0.5 rounded">cd backend && python app.py</code></p>
            </div>
          )}

          {status === 'error' && details && (!details.ffmpeg || !details.gemini) && (
            <div className="mt-2 text-sm text-yellow-700">
              {!details.ffmpeg && <p className="mb-1">⚠️ FFmpeg is required for video processing</p>}
              {!details.gemini && <p>⚠️ Gemini API key is not configured in backend/.env</p>}
            </div>
          )}
          
          <button
            onClick={checkStatus}
            className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Recheck Connection
          </button>
        </div>
      </div>
    </div>
  );
};
