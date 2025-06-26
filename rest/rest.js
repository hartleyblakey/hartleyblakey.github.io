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

    let uuid = JSON.parse(await response.text()); // parse into JS string

    let textbox = document.getElementById('createText');

    await fetch("https://diorama.asherville.dev/api/dioramas/" + uuid, {
        method: "POST",
        body: JSON.stringify({diorama: {text: textbox.value}}),
        headers: {
            "Content-type": "application/json"
        }
    });

    textbox.value = "";

    updateEntries();
}


function addCard(uuid, properties) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('generated');
    cardDiv.classList.add('entry');
    const labelElement = document.createElement('div');
    labelElement.classList.add('label');
    labelElement.textContent = uuid;

    const editTextElement = document.createElement('textarea');
    editTextElement.textContent = properties.text;

    const updateButtonElement = document.createElement('button');
    updateButtonElement.textContent = "Save";
    updateButtonElement.classList.add('saveButton');
    updateButtonElement.classList.add('b_all');
    updateButtonElement.id = "save" + uuid;

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
        headers: {
            "Content-type": "application/json"
        }
    });

    entries = await response.json();
    
    document.querySelectorAll('.generated').forEach(element => {
        element.remove();
    })

    for (const [uuid, properties] of Object.entries(entries)) {
        addCard(uuid, properties);
    }
}

async function saveEntry(event) {
    if (!event.target.classList.contains('saveButton')) {
        return;
    }
    let uuid = event.target.id.replace("save", "");
    let entry = event.target.closest('.entry');
    let textbox = entry.querySelector('textarea');
    if (textbox && textbox.value) {
        console.log("Writing to " + uuid + "a value of \"" + textbox.value + "\"");
        await fetch("https://diorama.asherville.dev/api/dioramas/" + uuid, {
            method: "POST",
            body: JSON.stringify({diorama: {text: textbox.value}}),
            headers: {
                "Content-type": "application/json"
            }
        });
    } else {
        console.error("Textbox not found or has no value");
    }

}


function onLoad() {
    console.log("REST script Loaded");
    var button = document.getElementById('createButton');
    
    if (!button) return;
    button.addEventListener("click", newEntry);

    var container = document.getElementById('mainContainer');
    container.addEventListener("click", saveEntry)

    updateEntries();
    
}
window.addEventListener("load", onLoad);