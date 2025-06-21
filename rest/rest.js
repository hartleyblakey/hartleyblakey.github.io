var entries;

async function newEntry() {
    console.log("Attempted to create new entry");
    let response = await fetch("https://diorama.asherville.dev/api/dioramas", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
            "Content-type": "application/json"
        }
    });

    updateEntries();
}


function addCard(uuid, properties) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('generated');
    cardDiv.classList.add('project');
    const labelElement = document.createElement('p');
    labelElement.classList.add('label');
    labelElement.textContent = uuid;

    const editTextElement = document.createElement('textarea');
    editTextElement.textContent = properties.text;

    const updateButtonElement = document.createElement('button');
    updateButtonElement.textContent = "Save";

    cardDiv.appendChild(labelElement);
    cardDiv.appendChild(editTextElement);
    cardDiv.appendChild(updateButtonElement);

    document.getElementById('mainContainer').prepend(cardDiv);

    /*
        <textarea> Hello, World!</textarea>
        <button id="createButton"> Save</button>
    */

}

async function updateEntries() {
    let response = await fetch("https://diorama.asherville.dev/api/dioramas", {
        method: "GET",
        body: JSON.stringify({}),
        headers: {
            "Content-type": "application/json"
        }
    });

    entries = JSON.parse(await response.json());
    
    document.querySelectorAll('.generated').forEach(element => {
        element.remove();
    })

    for (const [uuid, properties] of Object.entries(entries)) {
        addCard(uuid, properties);
    }
}



function onLoad() {
    console.log("REST script Loaded");
    var button = document.getElementById('createButton');
    
    if (!button) return;
    button.addEventListener("click", newEntry);
    
}
window.addEventListener("load", onLoad);