import state from '../state'
import {updateStateFn} from "../state"
import {eventEmitterConstants} from "../constants/eventEmiterConstants"

let $input = document.getElementById('fileinput');
$input.addEventListener('change', () => {
    loadFile();
});

function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function saveScene() {
    exportToJsonFile(state.objectsScheme);
}

function loadScene() {
    $input.click();
}

function loadFile() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        console.log("p", "The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
        console.log("p", "Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        console.log("p", "This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        console.log("p", "Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = function () {
            updateStateFn({
                type: eventEmitterConstants.REPLACE_STATE_FROM_SAVE,
                state: JSON.parse(fr.result)
            });
            $input.value = '';
        };
        fr.readAsText(file);
    }
}

export {
    saveScene,
    loadScene
}