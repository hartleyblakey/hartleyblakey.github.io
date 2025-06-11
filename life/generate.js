async function generateVisualization() {

    let userPrompt = document.getElementById('promptText').value;
    console.log("userPrompt =", userPrompt);
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
        visualization = responseText
            .replace(/^```glsl/, '')
            .replace(/```$/, '');
    }
    
    updatePrograms();
}

function onLoad() {
    var button = document.getElementById('generateButton');
    
    if (!button) return;
    button.addEventListener("click", generateVisualization);
}
window.addEventListener("load", onLoad);