async function generateVisualization(userPrompt) {
    let response = await fetch("https://cgcs.asherville.dev", {
        method: "POST",
        body: JSON.stringify({
            current: visualization,
            prompt: userPrompt
        }),
        headers: {
            "Content-type": "application/json"
        }
    });

    if (!response.ok) {
        console.error("Connection error:", response.status);
        // TODO: display some error
        return;
    }

    let responseText = await response.text();
    if (responseText === "") {
        console.error("Server error: returned empty string");
        // TODO: display some error
    } else {
        visualization = responseText;
    }
    
    updatePrograms();
}

function onLoad() {
    var button = document.getElementById('generateButton');
    let promptText = document.getElementById('promptText').value;
    if (!button) return;
    button.addEventListener("click", () => generateVisualization(promptText));
}
window.addEventListener("load", onLoad);