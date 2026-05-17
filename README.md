# 🎬 AI Video Composer

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)
![FFmpeg](https://img.shields.io/badge/FFmpeg-bundled-black.svg?logo=ffmpeg)
![Groq](https://img.shields.io/badge/Groq-AI_Powered-f56565.svg)

**Transform your media files with natural language using AI-powered FFmpeg commands**

[Features](#features) • [How It Works](#how-it-works) • [Installation](#installation) • [Usage](#usage) • [Tech Stack](#tech-stack)

</div>

---

## 📖 Overview

Welcome to **AI Video Composer**, a revolutionary modern web application that bridges the gap between human creativity and complex media processing. 

Have you ever wanted to edit a video, add transitions to a slideshow, or extract audio from a clip, only to be overwhelmed by the dense and unforgiving syntax of FFmpeg? **AI Video Composer solves this problem.** By leveraging the immense power of **Groq AI** and advanced Natural Language Processing (NLP) Large Language Models (LLMs), this tool allows you to simply type what you want in plain English. The AI understands your intent and automatically generates, optimizes, and executes the precise FFmpeg commands required to bring your vision to life.

## ✨ Features

- **🧠 NLP & LLM Powered Command Generation**
  The core of AI Video Composer is driven by an advanced NLP (Natural Language Processing) Large Language Model (LLM) that detects and understands human language. Based on your plain-text instructions, the LLM intelligently interprets your intent and builds the exact, optimized FFmpeg commands required to process your media. This eliminates the steep learning curve associated with complex FFmpeg syntax—simply tell the AI what you want (e.g., "add a fade-in effect and resize to 1080p"), and it handles the underlying command generation automatically.

- **🎨 Intuitive & Professional UI**
  Experience a beautiful, responsive dark/light theme designed with Tailwind CSS. It features gradient accents, smooth transitions, and a modern, clutter-free aesthetic.

- **🖱️ Drag-and-Drop Workflow**
  Easily manage your files. Drag and drop media into your Library, then simply drag or click to move them into your Compose timeline. The application automatically syncs files between sections.

- **✨ Interactive Click Spark Animations**
  Enjoy a delightful visual experience! A beautiful particle effect triggers on every click, providing satisfying visual feedback across the entire application.

- **⚡ Real-Time Processing & Output**
  Watch the magic happen in real-time. As the AI generates the command, you can monitor the live FFmpeg output logs directly in your browser, keeping you informed of the processing status.

- **🎥 Built-In Video & Media Player**
  Preview your generated masterpieces immediately. The built-in player allows you to watch the rendered output before you decide to download it.

- **🗂️ Broad Multi-Format Support**
  Whether you are working with images, audio, or high-definition video, the AI Video Composer handles it all.

---

## 🤖 How It Works (Under the Hood)

1. **User Input:** You select your media files (e.g., `video1.mp4`, `audio.mp3`) and provide a natural language prompt like *"Overlay the audio onto the video and trim the output to 15 seconds."*
2. **LLM Processing:** The frontend sends this request to our FastAPI backend. The backend constructs a highly detailed prompt containing your instructions and the metadata of your selected files.
3. **Command Generation:** The Groq AI model analyzes the request, understanding the nuances of human language. It formulates a syntactically correct and highly optimized FFmpeg command.
4. **Execution:** The backend safely executes this command using the *bundled* FFmpeg binary.
5. **Delivery:** Once processing is complete, the final media file is served back to the frontend for immediate playback and download.

---

## 🎛️ Deep Dive: FFmpeg & Its Commands

To truly appreciate what AI Video Composer does, it helps to understand the underlying engine: **FFmpeg**. 

FFmpeg is an industry-standard, incredibly powerful, open-source command-line tool used for handling multimedia data. It can decode, encode, transcode, mux, demux, stream, filter, and play almost anything that humans and machines have created. However, this immense power comes with a notoriously steep learning curve and highly complex syntax.

### The Anatomy of an FFmpeg Command
A standard FFmpeg command generally follows this structure:
`ffmpeg [global_options] {[input_file_options] -i input_url} ... {[output_file_options] output_url}`

Here is a breakdown of common flags the AI generates on your behalf:

- `-i <file>`: **Input.** Specifies the media file to read from. You can have multiple `-i` flags for multiple files.
- `-c:v` & `-c:a`: **Codec.** Specifies the video (`:v`) or audio (`:a`) codec to use. For example, `-c:v libx264` encodes video into the universally compatible H.264 format, while `-c:a aac` encodes audio into AAC.
- `-ss` & `-t`: **Time.** `-ss` seeks to a specific starting timestamp (e.g., `-ss 00:00:10`), and `-t` specifies the duration to capture (e.g., `-t 5` for 5 seconds).
- `-filter_complex` (or `-vf` / `-af`): **Filters.** This is where the real magic happens. Filters allow you to crop, scale, add text, overlay images, crossfade, and much more. The syntax within a filter graph can be extremely daunting (e.g., `[0:v]scale=1920:1080,fade=t=in:st=0:d=1[v]`).

### How AI Replaces Manual Coding
If you wanted to take a video, extract a 5-second clip starting at 10 seconds, scale it to 720p, and convert it to a GIF looping infinitely, the manual FFmpeg command would look like this:

```bash
ffmpeg -ss 00:00:10 -t 5 -i input.mp4 -vf "fps=15,scale=1280:720:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
```

With **AI Video Composer**, you simply type:
*"Extract 5 seconds starting from 0:10, make it 720p, and turn it into a high-quality GIF."*

The NLP LLM parses your sentence, identifies the timestamps, detects the desired resolution and output format, constructs the complex palette generation filter graph automatically, and executes it. You get professional-grade media manipulation without writing a single line of code.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Python 3.8 or higher** - Required for the FastAPI backend server.
- **Node.js 16 or higher** - Required for the React frontend.
- **Git** - For cloning the repository.

> **💡 Note on FFmpeg:** You do **not** need to install FFmpeg manually! A pre-configured `ffmpeg-8.0.1-essentials_build` is already bundled within the project repository to ensure maximum compatibility out-of-the-box.

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/AI-Video-Composer.git
   cd AI-Video-Composer
   ```

2. **Setup the Backend (Python)**
   Open a terminal in the project root:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   
   pip install -r backend/requirements.txt
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `backend/` directory and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Setup the Frontend (Node.js)**
   Open a separate terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```

### ⚡ Quick Start (Windows)

If you are on Windows, we've provided a convenient batch script to start both the backend and frontend simultaneously:

```bash
# In the root directory, simply run:
start.bat
```
This will automatically activate the virtual environment, start the FastAPI server, and launch the Vite development server in two separate console windows.

---

## 🛠️ Usage Guide

The application is structured into a simple **Three-Section Workflow**:

### 1. Library (Importing Media)
- Drag and drop your files into the **Library** pane on the left, or click the "Add File" button.
- Your files will be uploaded and temporarily stored for processing.

### 2. Compose (Drafting Your Project)
- Click on the files in your Library to move them into the **Compose** section.
- Order matters! The sequence in which you add files can influence how the AI interprets commands like "concatenate these videos."
- Use the **Clear All** button if you need to start fresh.

### 3. Prompt & Render (The Magic)
- In the text box, describe exactly what you want to do. 
- Click **Generate**.
- The AI will process your request, execute FFmpeg, and display the live logs.
- Once finished, preview the result in the **Render** section and click Download!

### 💡 Example Prompts to Try:

- *"Create a slideshow from these images with a 1-second crossfade transition between each, and add the audio file as background music."*
- *"Convert this video to a GIF at 15 frames per second and scale the width to 480 pixels."*
- *"Extract only the audio from this video and save it as an MP3."*
- *"Place the image as a watermark in the bottom right corner of the video with 50% opacity."*

---

## 📁 Supported File Formats

- **Images:** PNG, JPG, JPEG, WebP, TIFF, BMP, GIF, SVG
- **Audio:** MP3, WAV, OGG, AAC, M4A
- **Video:** MP4, AVI, MOV, MKV, FLV, WMV, WebM, MPG, MPEG, M4V

---

## 🏗️ Project Architecture & Tech Stack

```text
AI-Video-Composer/
├── backend/                  # FastAPI Application
│   ├── app.py                # Main server, API endpoints, and FFmpeg execution logic
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables (Groq API Key)
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Player, File Drop, etc.)
│   │   ├── services/         # Axios API service integrations
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main application shell
│   │   └── main.tsx          # React DOM entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite build configuration
├── ffmpeg-8.0.1-essentials/  # Bundled FFmpeg binary
├── start.bat                 # Windows quick-start script
└── README.md                 # You are here!
```

### Frontend
- **React 18.3 & TypeScript:** Robust, type-safe UI development.
- **Vite:** Blazing fast hot module replacement and building.
- **Tailwind CSS:** Modern, responsive utility-first styling.
- **Lucide React:** Clean, consistent SVG icons.
- **React Dropzone:** Seamless drag-and-drop file handling.

### Backend
- **FastAPI & Uvicorn:** High-performance, asynchronous Python web framework.
- **Groq AI:** Ultra-fast LLM inference for natural language understanding.
- **FFmpeg:** The industry standard for media processing.
- **MoviePy & Pillow:** Auxiliary libraries for complex image and video manipulation.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Made with ❤️ using React, FastAPI, and Groq AI.**

</div>
