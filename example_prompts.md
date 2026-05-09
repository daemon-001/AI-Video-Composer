# FFmpeg AI Composer - Example Prompts

Here is a comprehensive list of simple, direct prompts for common FFmpeg tasks, categorized by the types of files required to execute them. They are ordered from simplest to most complex.

### Image-Only Tasks
**Required Files:** 1 Image File

**Format Conversion**
> "Convert this image to PNG format."

**Resizing**
> "Resize this image to exactly 1920x1080 pixels, stretching it if necessary."

**Cropping**
> "Crop this image to a 1:1 square aspect ratio from the center."

**Image Compression**
> "Compress this image by reducing its quality to 70% to save disk space, and convert it to WebP format."

---

### Audio-Only Tasks
**Required Files:** 1 Audio File

**Format Conversion**
> "Convert this audio file to WAV format."

**Volume Adjustment**
> "Increase the volume of this audio track by 150%." (or "Decrease the volume by half.")

**Trimming Audio**
> "Cut this audio file to keep only the first 15 seconds."

**Adding Fade In/Out**
> "Add a 3-second audio fade-in at the beginning and a 3-second fade-out at the end of this track."

---

### Video-Only Tasks
**Required Files:** 1 Video File

**Format Conversion**
> "Convert this video to MP4 format."

**Muting (Removing Audio)**
> "Remove all audio tracks from this video so it is completely silent."

**Extracting a Frame**
> "Extract the frame exactly at the 5-second mark and save it as a high-quality JPG image."

**Extracting Audio from Video**
> "Extract the audio track from this video and save it as an MP3 file."

**Resizing / Downscaling**
> "Resize this video to 720p resolution (1280x720)."

**Trimming / Cutting**
> "Trim this video to keep only the footage from the 10-second mark to the 30-second mark."

**Changing Playback Speed**
> "Speed up this video so it plays twice as fast." (or "Slow down this video to half speed.")

**Video Compression / File Size Reduction**
> "Compress this video to significantly reduce its file size while keeping the resolution the same. Target a video bitrate of around 2Mbps and use the 'slow' preset for better quality."

---

### Image & Audio Tasks
**Required Files:** 1 Image File + 1 Audio File

**Podcast / Music Visualizer (Static)**
> "Create a video using the provided image as a static background. Play the provided audio track over it. The video should end exactly when the audio track ends."

**Dynamic Audio Waveform Visualizer**
> "Create an exciting music visualizer video. Use the provided image as the background, and generate a dynamic, animated audio waveform from the provided audio file. Overlay the waveform at the bottom of the screen in white color, and ensure the video matches the length of the song."

---

### Video & Audio Combination Tasks
**Required Files:** 1 Video File + 1 Audio File

**Replacing Audio (Muxing)**
> "Remove the original audio from the video and replace it entirely with the provided audio file. Trim the audio to match the video length."

**Mixing Background Music**
> "Keep the video's original audio, but add the provided audio file as background music. Lower the volume of the background music to 20% so you can still hear the original video."

**Audio over Still Frame**
> "Loop the provided video (if it's a short clip) or freeze it, and play the provided audio track over it until the audio finishes."

**The "Hype" Video (Fast-Paced Action)**
> "Create a high-energy video by taking the provided video clip, speeding it up by 1.5x, and adding the provided audio track. Increase the contrast of the video slightly and ensure the final video ends exactly when the fast-paced audio ends."

---

### Video & Image Tasks
**Required Files:** 1 Video File + 1 Image File

**Adding a Watermark / Logo**
> "Overlay the provided image onto the video to act as a watermark. Place it in the top right corner with a 10-pixel margin, and reduce the image's opacity to 50%."

**"Subscribe" Popup / Endcard Overlay**
> "Overlay the provided image onto the video at exactly the 10-second mark, and keep it on screen for 5 seconds. Place it in the bottom center of the screen to act as a popup graphic."

---

### Multiple Image Tasks
**Required Files:** 2 or more Image Files

**Basic Slideshow / Timelapse**
> "Create a simple video slideshow from these images. Show each image for exactly 1 second with no transitions between them. Make the video 30 frames per second."

**Creating a GIF**
> "Create an animated GIF looping through all these images, showing each for 0.5 seconds."

**Animated Slideshow (Without Audio)**
> "Generate a smooth, animated slideshow without any sound. Apply a 'Ken Burns' effect (slow zoom and pan) to each image. Display each image for exactly 4 seconds, and use a 1-second dissolve transition between each photo. Resize and crop the images to fill a 1920x1080 canvas."

---

### Multiple Video Tasks
**Required Files:** 2 or more Video Files

**Concatenation (Joining)**
> "Join all the provided video files together in order, one after the other, into a single video file."

**Side-by-Side (Split Screen)**
> "Put these two videos side-by-side in a split-screen format. Scale them so they both fit within a 1920x1080 canvas."

**Picture-in-Picture**
> "Use the first video as the main background. Take the second video, scale it down to 25% size, and place it in the bottom right corner as a picture-in-picture overlay."

**Dynamic Montage with Transitions**
> "Create an exciting montage by joining all these video clips together. Use a fast 0.5-second 'wipe' transition between each clip to make it feel dynamic."

---

### Multiple Images & Audio Tasks
**Required Files:** 2 or more Image Files + 1 Audio File

**Cinematic Slideshow (With Audio)**
> "Create a cinematic, emotional slideshow using all the provided images. Apply a subtle zoom-out animation to every image. Each image should stay on screen for 5 seconds, followed by a smooth 1.5-second crossfade transition. Add the provided audio track as background music. Fade out the music for the last 3 seconds to match the end of the slideshow."
