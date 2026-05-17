"""
FFmpeg AI Composer - FastAPI Backend with Groq AI
A modern backend service for generating FFmpeg commands using Groq's Llama models (FREE).
Get your API key from: https://console.groq.com/keys
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
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
import time
import re
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Groq API (FREE tier with generous limits)
# Get your API key from: https://console.groq.com/keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY not found in environment variables.\n"
        "Please add it to your .env file.\n"
        "Get a free API key from: https://console.groq.com/keys"
    )

# Using Llama 3.3 70B - fastest and most capable free model
GROQ_MODEL = "llama-3.3-70b-versatile"

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=GROQ_API_KEY,
)

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
    expose_headers=["X-Generated-Command", "X-AI-Response", "X-Process-Logs"],  # Expose custom headers
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

# Path to bundled FFmpeg executable
BASE_DIR = Path(__file__).parent.parent  # Project root
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"
FRONTEND_ASSETS_DIR = FRONTEND_DIST_DIR / "assets"
FFMPEG_BIN = BASE_DIR / "ffmpeg-8.0.1-essentials_build" / "bin" / "ffmpeg.exe"
FFPROBE_BIN = BASE_DIR / "ffmpeg-8.0.1-essentials_build" / "bin" / "ffprobe.exe"


def get_ffmpeg_path() -> str:
    """Get path to bundled FFmpeg executable"""
    if FFMPEG_BIN.exists():
        return str(FFMPEG_BIN)
    # Fallback to system FFmpeg if bundled version not found
    return "ffmpeg"


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
        ffmpeg_path = get_ffmpeg_path()
        result = subprocess.run(
            [ffmpeg_path, "-version"],
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


def sanitize_filename(filename: str) -> str:
    """Sanitize filename by replacing spaces, hyphens, and removing non-ASCII (including emoji)"""
    # Replace spaces and hyphens with underscores
    name = filename.replace(" ", "_").replace("-", "_")
    # Remove non-ASCII characters (including emoji)
    name = re.sub(r'[^\w\d_.]', '', name)
    return name


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
    """Generate FFmpeg command using OpenAI-compatible API"""
    
    files_table = create_files_info_table(files_info)
    
    system_prompt = """You are an expert FFmpeg engineer. Generate precise, working FFmpeg commands.

## FORMAT
1. Brief analysis (1-2 sentences)
2. Single FFmpeg command in a ```bash code block
3. Output file must be "output.mp4"

## RULES
- ONE command only, no chaining (&&, ;)
- Exact filenames from asset list
- Use: -y -c:v libx264 -pix_fmt yuv420p -movflags +faststart
- ALWAYS use `-map 0:v:0` (not `-map 0:v`) for video to avoid cover art errors!

## PATTERNS
1. Static Image + Audio:
`ffmpeg -y -loop 1 -framerate 1 -i img.jpg -i aud.mp3 -c:v libx264 -preset ultrafast -tune stillimage -pix_fmt yuv420p -c:a aac -shortest output.mp4`

2. Slideshow (CRITICAL: use `-t` before EACH `-i` img to avoid infinite loop):
`ffmpeg -y -loop 1 -t 3 -i 1.jpg -loop 1 -t 3 -i 2.jpg -filter_complex "[0]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v0];[1]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0" -c:v libx264 -pix_fmt yuv420p output.mp4`

3. Audio Waveform (s=WxH uses 'x', not ':'):
`ffmpeg -y -i aud.mp3 -i bg.png -filter_complex "[0:a]showwaves=s=1920x200:mode=line:colors=white[wave];[1]scale=1920:1080[bg];[bg][wave]overlay=0:(H-h)/2" -c:v libx264 -c:a aac output.mp4`

4. Add Background Music:
`... -i music.mp3 -map "[vout]" -map N:a -shortest -c:a aac output.mp4`

5. Concat Videos (all have audio):
`... -filter_complex "[0:v]scale=...[v0];[1:v]scale=...[v1];[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[vout][aout]" -map "[vout]" -map "[aout]"`

6. Concat (mixed audio): Generate `anullsrc=channel_layout=stereo:sample_rate=48000[silent]`, use in concat `a=1`.

7. Concat + replace audio: Use concat `a=0[vout]`, then `-map "[vout]" -map N:a`.

8. Speed changes: Apply `setpts` BEFORE scale/pad.

CRITICAL CONCAT RULES: Check `audio_channels` in assets. If None, video has NO audio. Match concat outputs to `-map`. Never reference missing audio streams.

## RESOLUTIONS
- vertical/TikTok/9:16: 1080x1920
- horizontal/16:9: 1920x1080
- square/1:1: 1080x1080"""

    user_message = f"""ASSETS:
{files_table}

TASK: {prompt}
Output MP4 as "output.mp4". Command must work with exact filenames."""

    if previous_error and previous_command:
        user_message += f"""

RETRY! Previous failed:
CMD: {previous_command}
ERR: {previous_error}

FIX GUIDE:
- "matches no streams": missing audio. Use concat a=0 or anullsrc.
- "incorrect codec parameters": mapped cover art. Use `-map 0:v:0`.
- "Output with label 'X' does not exist": mismatch between filter and -map.
- "do not match the corresponding output link": dimension mismatch, use scale+pad.
- "Padded dimensions cannot be smaller": fix pad calc or use 1920x1080.
- "Invalid argument": check filter syntax.
- "No option name near": in showwaves, use s=1920x200 (not :).
- "Error applying option... xfade": use 'duration' (not 'd' or 't').
- "divisible by 2": add scale=trunc(iw/2)*2:trunc(ih/2)*2."""

    user_message += "\n\nYOUR RESPONSE:"
    
    # Build messages array
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    
    # Call Groq API
    try:
        logger.info("Calling Groq API...")
        completion = await asyncio.to_thread(
            client.chat.completions.create,
            model=GROQ_MODEL,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            max_tokens=2048,
        )
        
        full_response = completion.choices[0].message.content
        logger.info(f"AI response length: {len(full_response)} characters")
        logger.info(f"AI response preview: {full_response[:500]}...")
        
    except Exception as e:
        logger.error(f"Error calling AI API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error calling AI API: {str(e)}"
        )
    
    # Extract command from code block - using the robust extraction from original project
    command = None
    
    # Try multiple code block patterns
    code_patterns = [
        r"```(?:bash|sh|shell)?\n(.*?)\n```",  # Standard code blocks
        r"```\n(.*?)\n```",  # Plain code blocks
        r"`([^`]*ffmpeg[^`]*)`",  # Inline code with ffmpeg
    ]
    
    for pattern in code_patterns:
        matches = re.findall(pattern, full_response, re.DOTALL | re.IGNORECASE)
        for match in matches:
            if "ffmpeg" in match.lower():
                command = match.strip()
                break
        if command:
            break
    
    # If no code block found, try to find ffmpeg lines directly
    if not command:
        ffmpeg_lines = [
            line.strip()
            for line in full_response.split("\n")
            if line.strip().lower().startswith("ffmpeg")
        ]
        if ffmpeg_lines:
            command = ffmpeg_lines[0]
    
    # Last resort: look for any line containing ffmpeg
    if not command:
        for line in full_response.split("\n"):
            line = line.strip()
            if "ffmpeg" in line.lower() and len(line) > 10:
                command = line
                break
    
    # Handle multi-line commands (remove line continuations)
    if command:
        logger.info(f"Extracted command: {command[:200]}...")
    else:
        logger.error("Failed to extract command from AI response")
        logger.error(f"Full response: {full_response}")
    
    return command, full_response


def execute_ffmpeg_command_sync(command: str, work_dir: Path) -> tuple[bool, str]:
    """Execute FFmpeg command synchronously and return success status and output"""
    try:
        logger.info(f"Executing FFmpeg in directory: {work_dir}")
        logger.info(f"Command length: {len(command)} characters")
        logger.info(f"Command: {command[:200]}..." if len(command) > 200 else f"Command: {command}")
        
        # Parse command into arguments (POSIX mode for proper quote handling)
        args = shlex.split(command, posix=True)
        
        logger.info(f"Parsed {len(args)} arguments")
        
        if args[0] != "ffmpeg":
            return False, "Command must start with 'ffmpeg'"
        
        # Replace 'ffmpeg' with path to bundled executable
        args[0] = get_ffmpeg_path()
        
        # Ensure -y is included to prevent blocking on file overwrite prompts
        if "-y" not in args:
            args.insert(1, "-y")
            
        # Execute FFmpeg command
        result = subprocess.run(
            args,
            cwd=work_dir,
            shell=False,  # Don't use shell to avoid arg escaping issues
            stdin=subprocess.DEVNULL,  # Prevent blocking on stdin (e.g. waiting for 'y'/'q')
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
    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

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
    groq_configured = GROQ_API_KEY is not None
    
    return {
        "status": "healthy" if ffmpeg_available and groq_configured else "unhealthy",
        "ffmpeg_installed": ffmpeg_available,
        "groq_configured": groq_configured,
        "model": GROQ_MODEL
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
    
    # Collect logs for frontend display
    process_logs = []
    
    if not check_ffmpeg_installed():
        raise HTTPException(status_code=500, detail="FFmpeg is not installed on the server")
    
    logger.info(f"Processing request: prompt='{prompt[:50]}...', files={len(files)}, temp={temperature}, top_p={top_p}")
    process_logs.append(f"[INFO] Processing {len(files)} file(s) with prompt: '{prompt[:50]}...'")
    
    # Create unique session directory
    session_id = str(uuid.uuid4())
    session_dir = WORK_DIR / session_id
    session_dir.mkdir(exist_ok=True)
    logger.info(f"Created session directory: {session_dir}")
    process_logs.append(f"[INFO] Created session: {session_id[:8]}")
    
    try:
        # Save uploaded files
        saved_files = []
        files_info = []
        
        logger.info(f"Saving {len(files)} uploaded files...")
        process_logs.append(f"[INFO] Uploading {len(files)} file(s)...")
        
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
            process_logs.append(f"[OK] Loaded: {sanitized_name} ({file_info.type})")
        
        # Generate FFmpeg command
        max_retries = 3
        retry_count = 0
        command = None
        full_response = None
        last_error = None
        
        process_logs.append("[INFO] Analyzing media files...")
        
        while retry_count < max_retries:
            try:
                # Add small delay between retries to respect rate limits
                if retry_count > 0:
                    delay = 2 * retry_count  # Progressive delay
                    logger.info(f"Waiting {delay} seconds before retry...")
                    await asyncio.sleep(delay)
                
                logger.info(f"Generating command (attempt {retry_count + 1}/{max_retries})")
                if retry_count == 0:
                    process_logs.append("[INFO] Generating FFmpeg commands...")
                else:
                    process_logs.append(f"[INFO] Retrying command generation (attempt {retry_count + 1})...")
                    
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
                process_logs.append("[OK] Generated FFmpeg command")
                
                # Log command for debugging
                logger.info(f"Full command length: {len(command)} characters")
                logger.debug(f"AI full response: {full_response}")
                
                # Execute command (run in thread pool to avoid blocking)
                process_logs.append("[INFO] Processing video...")
                success, output = await asyncio.to_thread(
                    execute_ffmpeg_command_sync, command, session_dir
                )
                
                if success:
                    process_logs.append("[SUCCESS] Video generated successfully!")
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
        # Use a pipe separator for logs (can't use newlines in HTTP headers)
        safe_logs = "||".join(process_logs)
        
        logger.info(f"Returning response with command length: {len(safe_command)}")
        logger.info(f"Command preview: {safe_command[:100]}...")
        
        return FileResponse(
            output_file,
            media_type="video/mp4",
            filename="output.mp4",
            headers={
                "X-Generated-Command": safe_command[:1000],  # Limit header size
                "X-AI-Response": safe_response[:500],
                "X-Process-Logs": safe_logs[:2000]  # Limit to 2KB
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


if FRONTEND_ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="assets")


if __name__ == "__main__":
    import uvicorn
    
    if not check_ffmpeg_installed():
        print("\n⚠️  WARNING: FFmpeg is not installed!")
        print("Please install FFmpeg before processing videos.")
    
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
