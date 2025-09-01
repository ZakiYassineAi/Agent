# AI Project Manager & Autonomous Developer

This project is an automated system designed to manage and complete GitHub projects using a local open-source AI model. It acts as a bridge between your GitHub repositories and an AI, automating the entire development workflow from task definition to pull request creation and merging.

## How it Works

The system follows a simple, powerful workflow:

1.  **Tasks**: You define ideas, bugs, or features in a `tasks.md` file.
2.  **Orchestration**: A Python script reads each task, clones the target repository, and prepares a prompt for the AI.
3.  **AI Code Generation**: The script sends the task and relevant file contents to your local Ollama AI model to get code suggestions.
4.  **Git Automation**: The script applies the AI's suggestions, creates a new branch, commits the changes, and pushes it to your GitHub repository.
5.  **Pull Request**: A pull request is automatically created for human validation or automated merging.
6.  **CI/CD (Optional)**: With the provided GitHub Actions workflow, pull requests can be automatically tested and merged if all tests pass.

## Setup Instructions

### 1. Prerequisites

Ensure you have the following installed on your local machine:
- [Python 3.8+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)
- [GitHub CLI (`gh`)](https://cli.github.com/)
- [Ollama](https://ollama.com/)

### 2. Ollama AI Setup

This system is configured to use **Llama 3.1** via Ollama.

1.  **Install Ollama**: Follow the instructions on the Ollama website.
2.  **Pull the model**: Run `ollama pull llama3.1` in your terminal.
3.  **Run the server**: Make sure the Ollama server is running. The scripts assume it is accessible at `http://localhost:11434`, but the user specified `http://localhost:5000/ask`. The config file is set to the user-specified endpoint.

### 3. System Configuration

1.  **Clone this repository**:
    ```bash
    git clone <url_of_this_ai_project_manager_repo>
    cd ai_project_manager
    ```

2.  **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Authenticate with GitHub**:
    The script uses the `gh` CLI to create pull requests. You need to authenticate it with your GitHub account.
    ```bash
    gh auth login
    ```
    Follow the on-screen instructions.

4.  **Configure Your Project**:
    Open `config/config.json` and edit the fields:
    - `github_repository_url`: The **SSH or HTTPS URL** of the GitHub project you want the AI to manage.
    - `tasks_file_path`: The path to your tasks file (default is `tasks.md` in this project's root).
    - `ollama_api_endpoint`: The API endpoint for your local AI model.

### 4. Usage

1.  **Define Your Tasks**:
    Open `tasks.md` and add tasks. The parser is simple and expects one task per line in the following format:
    ```markdown
    - In `path/to/your/file.js`, add a new function that does X.
    - In `README.md`, fix the typo in the introduction.
    ```
    The script uses the file path and the instruction to create the AI prompt.

2.  **Run the Agent**:
    Execute the main script from the `ai_project_manager` directory:
    ```bash
    python scripts/main.py
    ```
    The script will process each task, generate code, and create pull requests in your target repository.

## Adding CI/CD to Your Project

To enable fully autonomous testing and merging, use the provided workflow template.

1.  **Copy the workflow file**:
    Copy the content of `templates/ci_workflow.yml`.

2.  **Create the workflow in your target project**:
    In the GitHub project you are managing, create a new file at `.github/workflows/main.yml` and paste the content into it.

3.  **Enable Workflow Permissions**:
    In your target repository's GitHub settings, go to **Settings > Actions > General**. Under **Workflow permissions**, select **"Read and write permissions"** and save. This allows the `gh` CLI in the Action to merge pull requests.

4.  **Customize the Test Step**:
    In your new `.github/workflows/main.yml`, find the `Run tests` step and replace `pytest` with your project's actual test command (e.g., `npm test`, `go test`, etc.).
