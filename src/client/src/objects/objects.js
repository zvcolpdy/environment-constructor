import {scene} from '../mainParts/Scene'

import '../helpers/DragControls'
import './ObjectClass'
import { openPreloader, closePreloader} from '../menu/Preloaders'
import state from '../state'
import {eventEmitterConstants} from '../constants/eventEmiterConstants'

const objects = [];

// TODO: for optimization;
const objectById = {};

function setPropertyToObject(object, scheme){
    object._id = scheme._id;
    object.changeScale(scheme.scale);
    object.changeRotation(scheme.rotation);
    object.position.set(
        scheme.position.x,
        scheme.position.y,
        scheme.position.z
    );
    object.changeAllColors(scheme.arrOfMaterialColors);
    return scheme.deleted;
}

function cloneObject(instanceToClone){
    let object = instanceToClone.clone();

    // clone material
    object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            if(Array.isArray(child.material)){
                child.material = child.material.map((v) => v.clone());
            }else{
                child.material = child.material.clone();
            }
        }
    } );

    return object;
}

function updateObjects(payload){

    switch(payload.type){

        case eventEmitterConstants.REPLACE_STATE_FROM_SAVE: {
            const {objectsScheme} = payload;

            const arrOfObjectsData = Object.keys(objectsScheme).map(id => objectsScheme[id]);

            openPreloader();

            Promise.all( arrOfObjectsData.map((obj) =>  cloneObject(state.cashedObjects[obj.src].clone())))
                .then(arrOfNewObjects => {
                    for(let i = 0; i < arrOfNewObjects.length; i++){
                        setPropertyToObject(arrOfNewObjects[i], arrOfObjectsData[i]);
                    }
                    // clean current scene
                    objects.forEach(obj => {
                        scene.remove(obj);
                    });
                    objects.length = 0;
                    // setup new scene
                    arrOfNewObjects.forEach(obj => {
                        scene.add(obj);
                    });
                    objects.push.apply(objects, arrOfNewObjects);
                    closePreloader();
                });
            break;
        }

        case eventEmitterConstants.ADD_OBJECT_DATA: {
            // if object is deleted by another user
            if(payload.objectScheme){
                let object = cloneObject(state.cashedObjects[payload.objectScheme.src]);
                setPropertyToObject(object, payload.objectScheme);
                scene.add(object);
                objects.push(object);
            }

            break;
        }

        case eventEmitterConstants.DRAG_OBJECT: {

            const {x,y,z} = payload.objectScheme.position;

            let obj = objects.find(obj => obj._id === payload.objectScheme._id);
            obj && obj.position.set(x,y,z);

            break;

        }

        case eventEmitterConstants.ROTATE_OBJECT: {

            const {rotation, _id} = payload.objectScheme;

            let obj = objects.find(obj => obj._id === _id);
            obj && obj.changeRotation(rotation);

            break;

        }

        case eventEmitterConstants.SCALE_OBJECT: {

            const {scale, _id} = payload.objectScheme;

            let obj = objects.find(obj => obj._id === _id);
            obj && obj.changeScale(scale);

            break;

        }

        case eventEmitterConstants.DELETE_OBJECT: {
            const {objectId} = payload;

            let object = objects.find(obj => obj._id === objectId);
            object && scene.remove(object);
            object && objects.splice(objects.indexOf(object), 1);

            break;
        }

        case eventEmitterConstants.CHANGE_MATERIAL_COLOR: {
            let object = objects.find(obj => obj._id === payload.objectId);

            object.changeColor( payload.color.index, payload.color.value);

            break;
        }

    }
}

export {
    updateObjects,
    objects,
};