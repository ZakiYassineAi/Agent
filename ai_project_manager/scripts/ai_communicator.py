import json
import requests

def get_ai_suggestion(prompt: str, api_endpoint: str) -> str:
    """
    Sends a prompt to the local AI model and returns the suggestion.

    Args:
        prompt: The text prompt to send to the AI.
        api_endpoint: The URL of the AI API endpoint.

    Returns:
        The AI's response as a string.
    """
    headers = {"Content-Type": "application/json"}
    data = {"prompt": prompt}

    try:
        response = requests.post(api_endpoint, headers=headers, data=json.dumps(data))
        response.raise_for_status()  # Raise an exception for bad status codes
        return response.json().get("response", "")
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with the AI model: {e}")
        return ""

if __name__ == "__main__":
    # Example usage:
    # This block allows for direct testing of this script.
    # In the final system, the main.py script will call the get_ai_suggestion function.
    test_prompt = "Explain the importance of version control in software development."
    test_endpoint = "http://localhost:5000/ask"  # Example endpoint

    print(f"Sending test prompt to {test_endpoint}...")
    suggestion = get_ai_suggestion(test_prompt, test_endpoint)

    if suggestion:
        print("\nReceived suggestion from AI:")
        print(suggestion)
    else:
        print("\nFailed to get suggestion from AI.")
        print("Please ensure the Ollama server is running and accessible at the specified endpoint.")
