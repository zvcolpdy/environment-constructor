import {scene} from '../mainParts/Scene'
import {eventEmitterConstants} from '../constants/eventEmiterConstants'

const boxHelpers = {
    hoveredBox: new THREE.BoxHelper( undefined, 0x990000 ),
    selectedBox: new THREE.BoxHelper( undefined, 0x13566a )
};

boxHelpers.selectedBox.visible = false;
boxHelpers.hoveredBox.visible = false;

scene.add(boxHelpers.hoveredBox);
scene.add(boxHelpers.selectedBox);

function setBoxHelper(object, type){
    boxHelpers[type].visible = true;
    boxHelpers[type].setFromObject(object);
}

function unsetBoxHelper(type) {
    boxHelpers[type].visible = false;
}

function updateBoxHelper(type){
    let visibility = boxHelpers[type].visible;
    boxHelpers[type].update();
    boxHelpers[type].visible = visibility;
}

function updateBoxHelpers(payload){
    switch(payload.type){

        case eventEmitterConstants.DRAG_OBJECT: {
            updateBoxHelper("selectedBox");
            updateBoxHelper("hoveredBox");
            break;
        }

        case eventEmitterConstants.ROTATE_OBJECT:
        case eventEmitterConstants.SCALE_OBJECT: {
            updateBoxHelper("selectedBox");
            break;
        }

        case eventEmitterConstants.HOVER_MODEL: {
            setBoxHelper(payload.object, "hoveredBox");
            break;
        }

        case eventEmitterConstants.UNHOVER_MODEL: {
            unsetBoxHelper("hoveredBox");
            break;
        }

        case eventEmitterConstants.SET_SELECTED_OBJECT: {
            setBoxHelper(payload.object, "selectedBox");
            unsetBoxHelper("hoveredBox");
            break;
        }

        case eventEmitterConstants.DELETE_OBJECT: {
            unsetBoxHelper("hoveredBox");
            break;
        }

        case eventEmitterConstants.UNSET_SELECTED_OBJECT: {
            unsetBoxHelper("selectedBox");
            break;
        }
    }
}

export {
    updateBoxHelpers
}