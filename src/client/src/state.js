import EventEmitter from './helpers/EventEmitter';

// // user events on the scene
import './eventListeners/copyAndPaste'
import './eventListeners/dragControls'

import { updateBoxHelpers } from './objects/BoxHelpers'
import { updateMenu } from './menu/Menu'
import { updatePlane } from './objects/Plane'
import { updateObjects } from './objects/objects'

import { sendMessage } from './sockets'
import { openPreloader, closePreloader} from './menu/Preloaders'

import {eventEmitterConstants} from './constants/eventEmiterConstants';

const state = {
    gridHelper: {
        size: 5000,
        divisions: 50,
    },
    objectsScheme: {},
    selectedObject: null,
    cashedObjects: {},
    copyBufferObjectId: null,
};

function loadObject(url){
    return new Promise(function(resolve, reject) {
        if(state.cashedObjects[url]){
            let clonedObj = state.cashedObjects[url].clone()
            resolve(clonedObj);
        }else {
            let loader = new THREE.FBXLoader();
            loader.load( url, function ( object ) {
                state.cashedObjects[url] = object.clone();
                resolve(object);
            } );
        }
    });
}

function replaceStateFromSave(objectsScheme) {
    const arrOfObjectsData = Object.keys(objectsScheme).map(id => objectsScheme[id]);

    openPreloader();
    // cashed objects
    let arrOfUnicUrls = arrOfObjectsData.reduce((init, obj) => {
        if(init.indexOf(obj.src) === -1){
            init.push(obj.src)
        }
        return init
    }, []);

    return Promise.all(arrOfUnicUrls.map(loadObject));
}

// change eventEmitter for array of functions
const stateEmitter = new EventEmitter();
stateEmitter.on("UPDATES", updateObjects, updateMenu, updateBoxHelpers, updatePlane);

let savingTimer = null;

function updateStateFn(action, fromType){
    if(fromType !== "FROM_SERVER"){
        if(
            action.type !== eventEmitterConstants.UNSET_SELECTED_OBJECT &&
            action.type !== eventEmitterConstants.SET_SELECTED_OBJECT &&
            action.type !== eventEmitterConstants.HOVER_MODEL &&
            action.type !== eventEmitterConstants.UNHOVER_MODEL
        ){
            sendMessage(action);

            // saving
            clearTimeout(savingTimer);
            $("header h4").html("Saving...")
            savingTimer = setTimeout(function () {
                $("header h4").html("Saved")
            }, 3000)
        }
    }

    let answer = (function () {
        switch(action.type){

            /* BEGIN: change plane texture */

            case eventEmitterConstants.CHANGE_PLANE_TEXTURE: {

                stateEmitter.emit(
                    "UPDATES",
                    {
                        type: action.type,
                        src: action.src
                    }
                );

                break;
            }

            /* END: change plane texture */

            /* BEGIN: objects manipulations */

            case eventEmitterConstants.REPLACE_STATE_FROM_SAVE: {
                state.objectsScheme = action.state;

                openPreloader();
                replaceStateFromSave(state.objectsScheme).then(() => {
                    closePreloader();

                    stateEmitter.emit(
                        "UPDATES",
                        {
                            type: action.type,
                            objectsScheme: state.objectsScheme
                        }
                    );
                });

                break;
            }
            case eventEmitterConstants.ADD_OBJECT_DATA: {
                const {_id, src} = action;
                state.objectsScheme[_id] = {
                    _id,
                    src: src,
                    position: {x: 0, y: 0, z: 0},
                    scale: 1,
                    rotation: 0,
                    arrOfMaterialColors: []
                };

                openPreloader();
                loadObject(src)
                    .then(() => {
                        stateEmitter.emit(
                            "UPDATES",
                            {
                                type: action.type,
                                objectScheme: state.objectsScheme[_id]
                            }
                        );
                        closePreloader();
                    });
                break;
            }
            case eventEmitterConstants.DRAG_OBJECT: {
                state.objectsScheme[action._id].position = action.position;

                return {
                    payload: {
                        type: action.type,
                        objectScheme : state.objectsScheme[action._id]
                    }
                };
            }
            case eventEmitterConstants.ROTATE_OBJECT: {
                state.objectsScheme[action._id].rotation = action.radians;

                return {
                    payload: {
                        type: action.type,
                        objectScheme : state.objectsScheme[action._id]
                    }
                };
            }
            case eventEmitterConstants.SCALE_OBJECT: {

                state.objectsScheme[action._id].scale = action.scale;

                return {
                    payload: {
                        type: action.type,
                        objectScheme : state.objectsScheme[action._id]
                    }
                };
            }
            case eventEmitterConstants.DELETE_OBJECT: {
                delete state.objectsScheme[action._id];
                if(state.selectedObject === action._id){
                    updateStateFn({
                        type: eventEmitterConstants.UNSET_SELECTED_OBJECT
                    });
                }

                return {
                    payload: {
                        type: action.type,
                        objectId : action._id,
                        selectedObject: state.selectedObject
                    }
                };
            }
            case eventEmitterConstants.CHANGE_MATERIAL_COLOR: {
                state.objectsScheme[action._id].arrOfMaterialColors[action.color.index] = action.color.value;

                return {
                    payload: {
                        type: action.type,
                        objectId : action._id,
                        color: action.color
                    }
                };
            }

            /* END: objects manipulations */

            /* BEGIN: copy and paste */

            case eventEmitterConstants.COPY_MODEL: {
                state.copyBufferObjectId = state.selectedObject;
                break;
            }

            case eventEmitterConstants.PASTE_MODEL: {
                const {newId, copyBufferObjectId} = action;

                if(!copyBufferObjectId)
                    break;

                let {arrOfMaterialColors, position} = state.objectsScheme[copyBufferObjectId];

                let newObjectScheme = Object.assign(
                    {},
                    state.objectsScheme[copyBufferObjectId],
                    {
                        _id: newId,
                        arrOfMaterialColors: [...arrOfMaterialColors],
                        position: Object.assign({}, position)
                    });
                state.objectsScheme[newObjectScheme._id] = newObjectScheme;
                return {
                    payload: {
                        type: eventEmitterConstants.ADD_OBJECT_DATA,
                        objectScheme : newObjectScheme,
                    }
                }
            }

            /* END: copy and paste */

            /* BEGIN: selected objects action */

            case eventEmitterConstants.SET_SELECTED_OBJECT: {
                let _id = action.object._id;

                if(state.selectedObject !== _id){
                    state.selectedObject = _id;
                }

                return {
                    payload: {
                        type: action.type,
                        objectScheme: state.objectsScheme[_id],
                        object: action.object
                    }
                };
            }

            case eventEmitterConstants.UNSET_SELECTED_OBJECT: {
                state.selectedObject = null;
                return {
                    payload: {
                        type: action.type
                    }
                };
            }

            /* END: selected objects action */

            /* BEGIN: actions for boxHelpers */

            case eventEmitterConstants.HOVER_MODEL: {
                return {
                    payload: {
                        type: action.type,
                        object: action.object
                    }
                };
            }
            case eventEmitterConstants.UNHOVER_MODEL: {
                return {
                    payload: {
                        type: action.type
                    }
                };
            }

            /* END: actions for boxHelpers */

        }
    })();

    if(answer){
        stateEmitter.emit("UPDATES", answer.payload);
    }

}

export {updateStateFn};
export default state;