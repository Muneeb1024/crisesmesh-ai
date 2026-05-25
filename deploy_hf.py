import os, shutil, subprocess

src = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON\crisesmesh-ai"
dest = r"E:\WORKSPACE\AI-SEEKHO-ANTIGRAVITY-HACKATHON\hf_deploy"

# Read HF token from environment variable
HF_TOKEN = os.environ.get("HF_TOKEN", "")
if not HF_TOKEN:
    print("WARNING: HF_TOKEN env variable not set. Set it via: $env:HF_TOKEN='hf_xxx'")

print("Cleaning up old deploy dir...")
os.makedirs(dest, exist_ok=True)
for item in os.listdir(dest):
    if item == ".git":
        continue
    item_path = os.path.join(dest, item)
    try:
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)
    except Exception as e:
        print(f"Failed to delete {item_path}: {e}")

print("Copying files...")
shutil.copy(os.path.join(src, "Dockerfile"), dest)
shutil.copy(os.path.join(src, "HF_README.md"), os.path.join(dest, "README.md"))
shutil.copytree(os.path.join(src, "backend"), os.path.join(dest, "backend"), ignore=shutil.ignore_patterns(".venv", "__pycache__", "*.pyc"))
os.makedirs(os.path.join(dest, "mobile"), exist_ok=True)
shutil.copytree(os.path.join(src, "mobile", "dist"), os.path.join(dest, "mobile", "dist"))

with open(os.path.join(dest, ".gitignore"), "w") as f:
    f.write("backend/.venv\n.venv\n__pycache__\n")

print("Initializing git and pushing...")
os.chdir(dest)
HF_REMOTE_URL = f"https://Muneeb785:{HF_TOKEN}@huggingface.co/spaces/Muneeb785/crisesmesh-ai"
if not os.path.exists(".git"):
    subprocess.run(["git", "init"])
    subprocess.run(["git", "remote", "add", "hf", HF_REMOTE_URL])
else:
    subprocess.run(["git", "remote", "set-url", "hf", HF_REMOTE_URL])

subprocess.run(["git", "add", "."])
# Check if there are changes to commit
status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
if status.stdout.strip():
    subprocess.run(["git", "commit", "-m", "Deploy to HF"])
else:
    print("No changes to commit, skipping commit.")

# Push to Hugging Face
print("Pushing to Hugging Face Spaces...")
subprocess.run(["git", "push", "hf", "master:main", "--force"])
print("Deployment to HF Space Successful!")
