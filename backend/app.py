"""
FFmpeg AI Composer - FastAPI Backend with Gemini AI
A modern backend service for generating FFmpeg commands using Google's Gemini API.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
import subprocess
import tempfile
import shutil
from pathlib import Path
import json
from dotenv import load_dotenv
from PIL import Image
from moviepy.editor import VideoFileClip, AudioFileClip
import asyncio
import uuid
import traceback
import logging
import shlex

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in .env file.")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI(
    title="FFmpeg AI Composer",
    description="Generate FFmpeg commands using natural language with Gemini AI",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ALLOWED_EXTENSIONS = [
    ".png", ".jpg", ".jpeg", ".webp", ".tiff", ".bmp", ".gif", ".svg",
    ".mp3", ".wav", ".ogg",
    ".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".webm", ".mpg", ".mpeg", ".m4v"
]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_DURATION = 120  # 2 minutes

# Working directory for temporary files
WORK_DIR = Path(tempfile.gettempdir()) / "ffmpeg_composer"
WORK_DIR.mkdir(exist_ok=True)


class FileInfo(BaseModel):
    """Model for file information"""
    name: str
    type: str
    size: int
    dimensions: Optional[str] = None
    duration: Optional[float] = None
    audio_channels: Optional[int] = None


class ProcessRequest(BaseModel):
    """Model for processing request"""
    prompt: str
    temperature: float = 0.1
    top_p: float = 0.95


def check_ffmpeg_installed():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


def sanitize_filename(filename: str) -> str:
    """Sanitize filename by replacing spaces and hyphens with underscores"""
    return filename.replace(" ", "_").replace("-", "_")


def get_file_info(file_path: Path) -> FileInfo:
    """Extract metadata from media file"""
    info = FileInfo(
        name=sanitize_filename(file_path.name),
        type="unknown",
        size=file_path.stat().st_size
    )
    
    file_extension = file_path.suffix.lower()
    
    if file_extension in [".mp4", ".avi", ".mkv", ".mov", ".webm", ".flv", ".wmv"]:
        info.type = "video"
        try:
            video = VideoFileClip(str(file_path))
            info.duration = video.duration
            info.dimensions = f"{video.size[0]}x{video.size[1]}"
            if video.audio:
                info.type = "video/audio"
                info.audio_channels = video.audio.nchannels
            video.close()
        except Exception as e:
            print(f"Error reading video: {e}")
            
    elif file_extension in [".mp3", ".wav", ".ogg"]:
        info.type = "audio"
        try:
            audio = AudioFileClip(str(file_path))
            info.duration = audio.duration
            info.audio_channels = audio.nchannels
            audio.close()
        except Exception as e:
            print(f"Error reading audio: {e}")
            
    elif file_extension in [".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".gif", ".webp"]:
        info.type = "image"
        try:
            img = Image.open(file_path)
            info.dimensions = f"{img.size[0]}x{img.size[1]}"
        except Exception as e:
            print(f"Error reading image: {e}")
    
    return info


def create_files_info_table(files_info: List[FileInfo]) -> str:
    """Create a markdown table of file information"""
    table = "| Type | Name | Dimensions | Duration | Audio Channels |\n"
    table += "|------|------|------------|----------|----------------|\n"
    
    for info in files_info:
        dimensions = info.dimensions or "-"
        duration = f"{info.duration}s" if info.duration else "-"
        audio = f"{info.audio_channels} channels" if info.audio_channels else "-"
        table += f"| {info.type} | {info.name} | {dimensions} | {duration} | {audio} |\n"
    
    return table


async def generate_ffmpeg_command(
    prompt: str,
    files_info: List[FileInfo],
    temperature: float = 0.1,
    top_p: float = 0.95,
    previous_error: Optional[str] = None,
    previous_command: Optional[str] = None
) -> tuple[str, str]:
    """Generate FFmpeg command using Gemini AI"""
    
    files_table = create_files_info_table(files_info)
    
    system_prompt = """You are an expert FFmpeg engineer. Generate precise, working FFmpeg commands.

## OUTPUT FORMAT
1. Brief analysis (2-3 sentences max)
2. Single FFmpeg command in a ```bash code block
3. Output file must be "output.mp4"

## CORE RULES
- ONE command only, no chaining (no && or ;)
- Use exact filenames from the asset list
- Keep commands as simple as possible
- Always use: -c:v libx264 -pix_fmt yuv420p -movflags +faststart

## SLIDESHOW PATTERN (for multiple images)
When combining images with different dimensions:
```bash
ffmpeg -loop 1 -t 3 -i img1.jpg -loop 1 -t 3 -i img2.jpg -filter_complex "[0]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v0];[1]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0" -c:v libx264 -pix_fmt yuv420p output.mp4
```
- Default: 1920x1080, 3 seconds per image
- Vertical/portrait/TikTok: use 1080x1920
- Always scale+pad to normalize dimensions

## AUDIO WAVEFORM PATTERN
```bash
ffmpeg -i audio.mp3 -filter_complex "[0:a]showwaves=s=1920x1080:mode=line:rate=25,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -c:a aac output.mp4
```

## ERROR HANDLING
- If dimensions mismatch: use scale+pad approach
- If filter syntax errors: simplify and check parentheses
- For showwaves: use 's=1920x1080' format (NOT 's=1920:1080')"""

    user_message = f"""## AVAILABLE ASSETS

{files_table}

## TASK
{prompt}

## REQUIREMENTS
- Output format: MP4 video saved as "output.mp4"
- Generate a single, complete FFmpeg command
- Command must work with the exact filenames listed above"""

    if previous_error and previous_command:
        user_message += f"""

IMPORTANT: This is a retry attempt. The previous command failed with the following error:

PREVIOUS COMMAND (FAILED):
{previous_command}

ERROR MESSAGE:
{previous_error}

Please analyze the error and generate a corrected command that addresses the specific issue."""

    user_message += "\n\nYOUR RESPONSE:"
    
    # Configure Gemini model with parameters
    generation_config = {
        "temperature": temperature,
        "top_p": top_p,
        "top_k": 40,
        "max_output_tokens": 2048,
    }
    
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=generation_config,
    )
    
    # Generate response
    chat = model.start_chat(history=[])
    response = await asyncio.to_thread(
        chat.send_message,
        f"{system_prompt}\n\n{user_message}"
    )
    
    full_response = response.text
    
    # Extract command from code block
    command = None
    if "```bash" in full_response:
        start = full_response.find("```bash") + 7
        end = full_response.find("```", start)
        command = full_response[start:end].strip()
    elif "```" in full_response:
        start = full_response.find("```") + 3
        end = full_response.find("```", start)
        command = full_response[start:end].strip()
    
    return command, full_response


def execute_ffmpeg_command_sync(command: str, work_dir: Path) -> tuple[bool, str]:
    """Execute FFmpeg command synchronously and return success status and output"""
    try:
        logger.info(f"Executing FFmpeg in directory: {work_dir}")
        logger.info(f"Command: {command}")
        
        # Parse command into arguments (POSIX mode for proper quote handling)
        args = shlex.split(command, posix=True)
        
        if args[0] != "ffmpeg":
            return False, "Command must start with 'ffmpeg'"
        
        # Execute FFmpeg command
        result = subprocess.run(
            args,
            cwd=work_dir,
            shell=False,  # Don't use shell to avoid arg escaping issues
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        logger.info(f"FFmpeg return code: {result.returncode}")
        
        if result.returncode == 0:
            logger.info("FFmpeg execution successful")
            return True, result.stderr
        else:
            logger.warning(f"FFmpeg failed with stderr:\n{result.stderr}")
            return False, result.stderr
            
    except FileNotFoundError:
        error_msg = "FFmpeg not found. Please install FFmpeg and add it to your PATH."
        logger.error(error_msg)
        return False, error_msg
    except Exception as e:
        error_msg = f"Exception executing FFmpeg: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return False, error_msg


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "FFmpeg AI Composer API",
        "version": "2.0.0",
        "status": "running",
        "ai_model": "Google Gemini 2.5 Lite"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    ffmpeg_available = check_ffmpeg_installed()
    gemini_configured = GEMINI_API_KEY is not None
    
    return {
        "status": "healthy" if ffmpeg_available and gemini_configured else "unhealthy",
        "ffmpeg_installed": ffmpeg_available,
        "gemini_configured": gemini_configured
    }


@app.post("/process")
async def process_video(
    files: List[UploadFile] = File(...),
    prompt: str = Form(...),
    temperature: float = Form(0.1),
    top_p: float = Form(0.95)
):
    """
    Process media files with natural language instructions
    
    This endpoint:
    1. Receives uploaded files and instructions
    2. Generates FFmpeg command using Gemini AI
    3. Executes the command
    4. Returns the generated video
    """
    
    if not check_ffmpeg_installed():
        raise HTTPException(status_code=500, detail="FFmpeg is not installed on the server")
    
    logger.info(f"Processing request: prompt='{prompt[:50]}...', files={len(files)}, temp={temperature}, top_p={top_p}")
    
    # Create unique session directory
    session_id = str(uuid.uuid4())
    session_dir = WORK_DIR / session_id
    session_dir.mkdir(exist_ok=True)
    logger.info(f"Created session directory: {session_dir}")
    
    try:
        # Save uploaded files
        saved_files = []
        files_info = []
        
        logger.info(f"Saving {len(files)} uploaded files...")
        
        for upload_file in files:
            # Validate file extension
            file_ext = Path(upload_file.filename).suffix.lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type {file_ext} not allowed"
                )
            
            # Save file
            sanitized_name = sanitize_filename(upload_file.filename)
            file_path = session_dir / sanitized_name
            
            logger.info(f"Saving file: {sanitized_name}")
            
            with open(file_path, "wb") as buffer:
                content = await upload_file.read()
                buffer.write(content)
            
            saved_files.append(file_path)
            
            # Get file info
            logger.info(f"Analyzing file: {sanitized_name}")
            file_info = get_file_info(file_path)
            files_info.append(file_info)
            logger.info(f"File info: {file_info}")
        
        # Generate FFmpeg command
        max_retries = 3
        retry_count = 0
        command = None
        full_response = None
        last_error = None
        
        while retry_count < max_retries:
            try:
                logger.info(f"Generating command (attempt {retry_count + 1}/{max_retries})")
                command, full_response = await generate_ffmpeg_command(
                    prompt=prompt,
                    files_info=files_info,
                    temperature=temperature,
                    top_p=top_p,
                    previous_error=last_error,
                    previous_command=command
                )
                
                if not command:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to extract FFmpeg command from AI response"
                    )
                
                logger.info(f"Generated command: {command}")
                
                # Execute command (run in thread pool to avoid blocking)
                success, output = await asyncio.to_thread(
                    execute_ffmpeg_command_sync, command, session_dir
                )
                
                if success:
                    logger.info("Video generated successfully")
                    break
                
                logger.warning(f"Command failed with error:\n{output}")
                logger.warning(f"Full command was: {command}")
                last_error = output
                retry_count += 1
            except Exception as gen_error:
                logger.error(f"Error in command generation: {str(gen_error)}")
                raise
        
        # Check if output file was created
        output_file = session_dir / "output.mp4"
        if not output_file.exists():
            error_msg = f"Failed to generate video after {max_retries} attempts. Last error: {last_error}"
            logger.error(error_msg)
            raise HTTPException(
                status_code=500,
                detail=error_msg
            )
        
        # Return the video file
        # Clean header values (remove newlines and special chars that are invalid in HTTP headers)
        safe_command = (command or "").replace('\n', ' ').replace('\r', '').replace('\t', ' ')
        safe_response = (full_response or "")[:500].replace('\n', ' ').replace('\r', '').replace('\t', ' ')
        
        return FileResponse(
            output_file,
            media_type="video/mp4",
            filename="output.mp4",
            headers={
                "X-Generated-Command": safe_command[:1000],  # Limit header size
                "X-AI-Response": safe_response[:500]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing video: {str(e)}"
        )
    
    finally:
        # Cleanup (in production, might want to keep files for a while)
        # Uncomment to enable cleanup:
        # shutil.rmtree(session_dir, ignore_errors=True)
        pass


@app.post("/generate-command")
async def generate_command_only(
    files: List[UploadFile] = File(...),
    prompt: str = Form(...),
    temperature: float = Form(0.1),
    top_p: float = Form(0.95)
):
    """
    Generate FFmpeg command without executing it
    Useful for previewing the command before execution
    """
    
    session_id = str(uuid.uuid4())
    session_dir = WORK_DIR / session_id
    session_dir.mkdir(exist_ok=True)
    
    try:
        # Save and analyze files
        files_info = []
        
        for upload_file in files:
            sanitized_name = sanitize_filename(upload_file.filename)
            file_path = session_dir / sanitized_name
            
            with open(file_path, "wb") as buffer:
                content = await upload_file.read()
                buffer.write(content)
            
            file_info = get_file_info(file_path)
            files_info.append(file_info)
        
        # Generate command
        command, full_response = await generate_ffmpeg_command(
            prompt=prompt,
            files_info=files_info,
            temperature=temperature,
            top_p=top_p
        )
        
        return {
            "command": command,
            "full_response": full_response,
            "files_info": [info.dict() for info in files_info]
        }
        
    finally:
        # Cleanup temporary files
        shutil.rmtree(session_dir, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting FFmpeg AI Composer Backend")
    print(f"📁 Working directory: {WORK_DIR}")
    print(f"🤖 AI Model: Google Gemini 2.5 Lite")
    
    if not check_ffmpeg_installed():
        print("\n⚠️  WARNING: FFmpeg is not installed!")
        print("Please install FFmpeg before processing videos.")
    
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
