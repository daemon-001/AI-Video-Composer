# AI Video Composer

<div align="center">

**Transform your media files with natural language using AI-powered FFmpeg commands**

</div>

---

## Overview

AI Video Composer is a modern web application that leverages the power of Groq AI to generate and execute FFmpeg commands through natural language prompts. Simply describe what you want to do with your media files, and let AI handle the complex FFmpeg syntax.

## Features

- **Intuitive UI** - Beautiful dark/light theme with drag-and-drop file management
- **AI-Powered** - Natural language to FFmpeg command translation using Groq AI
- **Multi-Format Support** - Images, videos, and audio files
- **Real-Time Processing** - Live command output and processing status
- **Three-Section Workflow** - Library → Compose → Render
- **Click Animations** - Beautiful sparkle effects on every interaction
- **Drag & Drop** - Easy file management across sections
- **Video Preview** - Built-in player for viewing output
- **Professional Design** - Gradient accents, smooth transitions, and modern UI

## Usage

1. **Library Files**: Drag and drop or click "Add File" to import media files
2. **Compose Project**: Add files to the Compose section by clicking on them in Library
3. **Describe Your Vision**: Type what you want to create in natural language
   - Example: "Create a slideshow with fade transitions between images"
   - Example: "Add background music to the video and reduce volume by 50%"
   - Example: "Concatenate all videos and add a 2-second fade at the end"
4. **Generate**: Click the "Generate" button to create your media
5. **Render**: Preview the result in the video player and download if satisfied

## Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **React Dropzone** - File upload handling
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Groq AI** - Advanced language model for command generation
- **FFmpeg** - Media processing (bundled - no system installation required)
- **MoviePy** - Python video editing
- **Pillow** - Image processing

## Prerequisites

- **Python 3.8+** - For the backend server
- **Node.js 16+** - For the frontend development
- **FFmpeg** - Already bundled in the project (`ffmpeg-8.0.1-essentials_build` folder)

> **Note**: FFmpeg is included in the project, so you don't need to install it separately on your system!

## Project Structure

```
AI-Video-Composer/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── vite.config.ts     # Vite configuration
└── README.md
```

## Features in Detail

### Click Spark Animation
Beautiful particle effect that triggers on every click, providing visual feedback across the entire application.

### Dark/Light Theme
Toggle between professional dark mode (default) and clean light mode with a single click.

### Drag & Drop
- Drag files into Library section
- Drag files into Compose section
- Automatically sync files between sections

### Clear All
Quick button to clear all files from the Compose section and start fresh.

## Configuration

### Supported File Formats

**Images**: PNG, JPG, JPEG, WebP, TIFF, BMP, GIF, SVG  
**Audio**: MP3, WAV, OGG  
**Video**: MP4, AVI, MOV, MKV, FLV, WMV, WebM, MPG, MPEG, M4V

---

<div align="center">

**Made with React, FastAPI, and Groq AI by** 

</div>
