import os
import asyncio
import edge_tts
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip

# Configuration
VIDEO_PATH = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON-2026\crisesmesh-ai-1.0\Extra-Resources\crises-mesh.mp4"
OUTPUT_PATH = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON-2026\crisesmesh-ai-1.0\Extra-Resources\crises-mesh-with-voice.mp4"
TEMP_DIR = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON-2026\crisesmesh-ai-1.0\scratch\audio_temp"
VOICE = "en-US-BrianNeural" # High-quality human-like neural voice

# Define segments and timestamps
segments = [
    {
        "start": 1.0,
        "text": "Welcome to CrisesMesh AI, a unified crisis command and safety portal. The platform links citizens and emergency responders in real-time, providing immediate telemetry and coordination."
    },
    {
        "start": 14.0,
        "text": "Here we are inside the Citizen Portal, logged in as Ali Khan. The dashboard shows live emergency telemetry, verified rescue lifelines, and options to report active flooding or check safety routes."
    },
    {
        "start": 30.0,
        "text": "Let's submit an emergency report. We select our category and severity level. Citizens can type details or record their voice using our built-in smart AI voice recorder."
    },
    {
        "start": 46.0,
        "text": "We attach a photo of the incident, tagged with secure GPS telemetry and integrity stamps to prevent fraud, and then submit the report to the command center."
    },
    {
        "start": 58.0,
        "text": "Once submitted, the citizen gets immediate status feedback. The multi-agent pipeline immediately starts running to fuse signals, categorize severity, and alert local authorities."
    },
    {
        "start": 74.0,
        "text": "Next, citizens can view the Live Safety Map to inspect active threat zones. A draggable location marker allows citizens to test proximity warnings and get safety advisories."
    },
    {
        "start": 92.0,
        "text": "They can also check the Live Alerts Hub to review active evacuation broadcasts and safety directives from the government command center."
    },
    {
        "start": 105.0,
        "text": "Now let's switch to the Government Command Center. The dashboard displays centralized statistics on people at risk, situation threat levels, and active AI-prioritized incidents."
    },
    {
        "start": 122.0,
        "text": "Here, the dispatcher triggers the Multi-Agent Orchestrator pipeline. The automated agents perform signal fusion, vetting, and classification in real time."
    },
    {
        "start": 138.0,
        "text": "Following the pipeline execution, the fire incident details update dynamically. The severity escalates to critical and the risk radius expands to twelve hundred meters based on AI insights."
    },
    {
        "start": 152.0,
        "text": "The Crisis Resolution Simulator compares raw conflicting citizen reports against the consolidated, one hundred percent vetted and de-duplicated crisis profile."
    },
    {
        "start": 168.0,
        "text": "We can view real-time resource utilization loads and access the AI Orchestrator Sandbox to manually override dispatch thresholds or toggle cognitive agents."
    },
    {
        "start": 182.0,
        "text": "The system provides intelligent Resource Allocation recommendations. The dispatcher reviews and approves the recommended emergency units for immediate dispatch."
    },
    {
        "start": 200.0,
        "text": "We then proceed to Alert Approval. The system auto-generates bilingual alerts in English and Roman Urdu, allowing the dispatcher to review and publish them instantly."
    },
    {
        "start": 216.0,
        "text": "Back on the dashboard, we can manually override and bypass specific agent stages, such as the Signal Fusion Agent, to adapt to dynamic scenarios."
    },
    {
        "start": 230.0,
        "text": "The Red Zone Map provides dynamic threat visualization. The Detour Simulator automatically calculates unsafe zones and computes safe alternative detour routes for citizens."
    },
    {
        "start": 245.0,
        "text": "We inspect the details of the active incident. The eight-signal fusion panel aggregates citizen reports, rainfall telemetry, and traffic congestion indexes into a unified confidence score."
    },
    {
        "start": 265.0,
        "text": "Finally, the dispatcher reviews the live alert status. The alert is confirmed as live, with the option to retract it if the situation is resolved. CrisesMesh AI makes crisis management seamless and intelligent."
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
    
    # If the video has an audio track, lower its volume to act as background hum/music
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
    # Write using standard settings
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
    for seg in segments:
        pass # AudioFileClips are closed when CompositeAudioClip/video is closed
        
    print("Done! Final video generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
