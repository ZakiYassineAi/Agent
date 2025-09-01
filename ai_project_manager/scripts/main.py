import json
import os
import re
import subprocess
import sys

# Add the script's directory to the Python path to allow importing ai_communicator
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ai_communicator import get_ai_suggestion

def run_command(command, working_dir):
    """Runs a command in a specified directory and handles errors."""
    print(f"Running command: {' '.join(command)}")
    result = subprocess.run(command, cwd=working_dir, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {' '.join(command)}")
        print(f"Stdout: {result.stdout}")
        print(f"Stderr: {result.stderr}")
        raise RuntimeError(f"Command failed: {' '.join(command)}")
    print(result.stdout)
    return result.stdout

def parse_task(task_line):
    """
    Parses a task line to extract the file to modify and the instruction.
    Expected format: "- In `path/to/file.ext`, do something."
    """
    match = re.search(r"- In `(.+?)`, (.+)", task_line)
    if not match:
        return None, None
    return match.group(1), match.group(2) # file_path, instruction

def main():
    """Main orchestration function."""
    # Construct paths relative to this script's location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    config_path = os.path.join(project_root, "config", "config.json")
    workspace_dir = os.path.join(project_root, "workspace")

    # 1. Read Configuration
    with open(config_path, 'r') as f:
        config = json.load(f)

    repo_url = config["github_repository_url"]
    tasks_file = os.path.join(project_root, config["tasks_file_path"])
    api_endpoint = config["ollama_api_endpoint"]
    repo_name = repo_url.split('/')[-1].replace('.git', '')
    local_repo_path = os.path.join(workspace_dir, repo_name)

    # 2. Clone or update the repository
    if not os.path.exists(local_repo_path):
        print(f"Cloning repository {repo_url}...")
        run_command(["git", "clone", repo_url, local_repo_path], working_dir=workspace_dir)
    else:
        print(f"Repository {repo_name} already exists. Pulling latest changes.")
        run_command(["git", "pull"], working_dir=local_repo_path)

    # 3. Read and process tasks
    with open(tasks_file, 'r') as f:
        tasks = [line for line in f if line.strip()]

    for task in tasks:
        file_to_modify, instruction = parse_task(task)
        if not file_to_modify or not instruction:
            print(f"Skipping malformed task: {task.strip()}")
            continue

        print(f"\n--- Processing Task: {instruction} in {file_to_modify} ---")

        # 4. Create a new branch for the task
        branch_slug = re.sub(r'[^a-z0-9]+', '-', instruction.lower()).strip('-')
        branch_name = f"ai-dev/{branch_slug[:50]}"
        print(f"Creating new branch: {branch_name}")
        run_command(["git", "checkout", "main"], working_dir=local_repo_path) # Start from main
        run_command(["git", "pull"], working_dir=local_repo_path) # Ensure main is up to date
        run_command(["git", "checkout", "-b", branch_name], working_dir=local_repo_path)

        # 5. Construct prompt and get AI suggestion
        target_file_path = os.path.join(local_repo_path, file_to_modify)

        if not os.path.exists(target_file_path):
            print(f"File {file_to_modify} does not exist. Creating it.")
            file_content = "" # Start with empty content for new files
        else:
            with open(target_file_path, 'r') as f:
                file_content = f.read()

        prompt = f"""
You are an autonomous AI developer. Your task is to modify a codebase based on the user's instruction.
You will be given the content of a file and an instruction.
Your response MUST be the complete, updated content of the file. Do not add any explanations, comments, or markdown formatting around the code.

Instruction: "{instruction}"

File Content:
---
{file_content}
---
        """

        print("Sending prompt to AI...")
        ai_suggestion = get_ai_suggestion(prompt, api_endpoint)

        if not ai_suggestion:
            print("Failed to get suggestion from AI. Skipping task.")
            continue

        # 6. Apply AI changes
        print(f"Applying AI suggestion to {file_to_modify}")
        with open(target_file_path, 'w') as f:
            f.write(ai_suggestion)

        # 7. Commit and Push
        print("Committing changes...")
        run_command(["git", "add", "."], working_dir=local_repo_path)
        commit_message = f"feat: {instruction}"
        run_command(["git", "commit", "-m", commit_message], working_dir=local_repo_path)

        print("Pushing changes...")
        run_command(["git", "push", "-u", "origin", branch_name], working_dir=local_repo_path)

        # 8. Create Pull Request
        print("Creating Pull Request...")
        # Note: This requires the 'gh' CLI to be installed and authenticated.
        pr_title = f"AI: {instruction}"
        pr_body = f"This PR was automatically generated by an AI agent to address the following task:\n\n> {task.strip()}"
        try:
            run_command(["gh", "pr", "create", "--title", pr_title, "--body", pr_body, "--fill"], working_dir=local_repo_path)
        except RuntimeError as e:
            print(f"Failed to create pull request. Please ensure the 'gh' CLI is installed and authenticated.")
            print(e)

    print("\nAll tasks processed.")

if __name__ == "__main__":
    main()
