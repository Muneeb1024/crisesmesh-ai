import os
import asyncio
import edge_tts
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip

# Configuration
VIDEO_PATH = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON-2026\crisesmesh-ai-1.0\Extra-Resources\antigravity-usage.mp4"
OUTPUT_PATH = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON-2026\crisesmesh-ai-1.0\Extra-Resources\antigravity-usage-with-voice.mp4"
TEMP_DIR = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON-2026\crisesmesh-ai-1.0\scratch\usage_audio_temp"
VOICE = "en-US-BrianNeural" # High-quality human-like neural voice

# Define segments and timestamps
segments = [
    {
        "start": 1.0,
        "text": "Welcome to Antigravity, your intelligent, autonomous AI coding companion. In this video, we witness the power of Antigravity in action as it manages the entire deployment cycle of our CrisesMesh AI application."
    },
    {
        "start": 18.0,
        "text": "We start as the developer requests the application to go live. Instantly, Antigravity formulates a detailed execution plan, launches background tasks, and begins compiling the React Native web assets."
    },
    {
        "start": 38.0,
        "text": "Watch how Antigravity handles real-world errors. When the deployment script encounters a missing Git repository in the target directory, Antigravity doesn't stop—it immediately decides to initialize and configure Git on-the-fly."
    },
    {
        "start": 58.0,
        "text": "Here, a PowerShell syntax error occurs when using standard double ampersands. Antigravity detects the issue, explains that PowerShell requires semicolons as statement separators, rewrites the command, and successfully runs it."
    },
    {
        "start": 80.0,
        "text": "After resolving environment hurdles, Antigravity stages, commits, and force-pushes the code to Hugging Face Spaces. It accurately parses the console output to confirm the push was successful despite standard shell warnings."
    },
    {
        "start": 105.0,
        "text": "Simultaneously, on the right pane, Antigravity works in parallel to update the project walkthrough, documenting interface enhancements like the Red Zone Map fixes and the new bilingual Command Center pin screen."
    },
    {
        "start": 130.0,
        "text": "Finally, Antigravity provides a clean, interactive summary table of the deployment status, including web bundling, git commits, and docker build progress, complete with direct URLs to the live environment."
    },
    {
        "start": 155.0,
        "text": "With Antigravity, complex deployments, troubleshooting, and documentation are entirely automated. It acts not just as an assistant, but as an elite engineering partner that takes care of every detail. Experience the future of coding with Antigravity."
    }
]

async def generate_voice(text, output_file):
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(output_file)
    print(f"Generated voice clip: {output_file}")

async def main():
    os.makedirs(TEMP_DIR, exist_ok=True)
    
    # 1. Generate speech audio files
    tasks = []
    for i, seg in enumerate(segments):
        file_path = os.path.join(TEMP_DIR, f"seg_{i:02d}.mp3")
        seg["file"] = file_path
        tasks.append(generate_voice(seg["text"], file_path))
    
    await asyncio.gather(*tasks)
    print("All voice clips generated successfully!")
    
    # 2. Mix with video using MoviePy
    print(f"Loading video from: {VIDEO_PATH}")
    video = VideoFileClip(VIDEO_PATH)
    
    audio_clips = []
    
    # If the video has an audio track, lower its volume to act as background hum
    if video.audio:
        print("Original video audio detected. Scaling volume down to 10%...")
        bg_audio = video.audio.with_volume_scaled(0.1)
        audio_clips.append(bg_audio)
    
    # Load and schedule each voiceover clip
    for seg in segments:
        voice_clip = AudioFileClip(seg["file"])
        voice_clip = voice_clip.with_start(seg["start"])
        audio_clips.append(voice_clip)
        
    print("Combining audio clips...")
    composite_audio = CompositeAudioClip(audio_clips)
    
    print("Applying composite audio to video...")
    final_video = video.with_audio(composite_audio)
    
    print(f"Writing final video to: {OUTPUT_PATH}")
    final_video.write_videofile(
        OUTPUT_PATH,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile=os.path.join(TEMP_DIR, "temp-audio.m4a"),
        remove_temp=True
    )
    
    # Close clips
    video.close()
    final_video.close()
        
    print("Done! Final video generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
