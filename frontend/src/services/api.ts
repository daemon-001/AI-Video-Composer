// API Service for communicating with the backend

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for video processing
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface FileInfo {
  name: string;
  type: string;
  size: number;
  dimensions?: string;
  duration?: number;
  audio_channels?: number;
}

export interface ProcessRequest {
  files: File[];
  prompt: string;
  temperature?: number;
  top_p?: number;
}

export interface ProcessResponse {
  video: Blob;
  command: string;
  aiResponse: string;
}

export interface CommandResponse {
  command: string;
  full_response: string;
  files_info: FileInfo[];
}

export interface HealthResponse {
  status: string;
  ffmpeg_installed: boolean;
  groq_configured: boolean;
  model: string;
}

class APIService {
  /**
   * Check backend health status
   */
  async checkHealth(): Promise<HealthResponse> {
    const response = await api.get('/health');
    return response.data;
  }

  /**
   * Process files and generate video
   */
  async processVideo(request: ProcessRequest): Promise<ProcessResponse> {
    const formData = new FormData();
    
    // Add files
    request.files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Add parameters
    formData.append('prompt', request.prompt);
    formData.append('temperature', String(request.temperature ?? 0.1));
    formData.append('top_p', String(request.top_p ?? 0.95));

    const response = await api.post('/process', formData, {
      responseType: 'blob',
    });

    // Extract headers
    const command = response.headers['x-generated-command'] || '';
    const aiResponse = response.headers['x-ai-response'] || '';

    return {
      video: response.data,
      command,
      aiResponse,
    };
  }

  /**
   * Generate FFmpeg command without executing
   */
  async generateCommand(request: ProcessRequest): Promise<CommandResponse> {
    const formData = new FormData();
    
    request.files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('prompt', request.prompt);
    formData.append('temperature', String(request.temperature ?? 0.1));
    formData.append('top_p', String(request.top_p ?? 0.95));

    const response = await api.post('/generate-command', formData);
    return response.data;
  }

  /**
   * Test connection to backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await api.get('/');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = new APIService();
export default api;
