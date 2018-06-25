import {eventEmitterConstants} from '../constants/eventEmiterConstants'
import {updateStateFn} from '../state'
import { objects } from '../objects/objects'
import {controls} from  "../render";
import renderer from '../mainParts/Renderer'
import camera from '../mainParts/Camera'
import state from '../state'

const dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
dragControls.addEventListener( 'dragstart', function ( event ) {
    controls.enabled = false;
});
dragControls.addEventListener( 'dragend', function ( event ) {
    controls.enabled = true;
});
dragControls.addEventListener( 'hoveron', function (event) {
    if(event.object !== state.selectedObject){
        updateStateFn({
            type: eventEmitterConstants.HOVER_MODEL,
            object: event.object
        });
    }
});
dragControls.addEventListener( 'hoveroff', function (event) {
    if(event.object !== state.selectedObject){
        updateStateFn({
            type: eventEmitterConstants.UNHOVER_MODEL
        });
    }
});
dragControls.addEventListener( 'drag', function (event) {
    updateStateFn({
        type: eventEmitterConstants.DRAG_OBJECT,
        _id: event._id,
        position: event.position
    });
});
dragControls.addEventListener( 'deleteObject', function (event) {
    updateStateFn({
        type: eventEmitterConstants.DELETE_OBJECT,
        _id: event._id,
    });
});
dragControls.addEventListener( 'dblclick', function (event) {
    if(event.object){
        updateStateFn({
            type: eventEmitterConstants.SET_SELECTED_OBJECT,
            object: event.object
        });
    }else{
        updateStateFn({
            type: eventEmitterConstants.UNSET_SELECTED_OBJECT,
        });
    }
});