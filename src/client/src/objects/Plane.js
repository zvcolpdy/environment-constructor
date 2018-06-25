import {scene} from '../mainParts/Scene'
import {eventEmitterConstants} from '../constants/eventEmiterConstants'

let geometry = new THREE.PlaneBufferGeometry( 3000, 3000, 3000 );
let material = new THREE.MeshBasicMaterial( {
    // color: 0xffffff,
    side: THREE.DoubleSide,
} );

function updateTexture(src){
    let newTexture = new THREE.TextureLoader().load(src);
    newTexture.wrapS = THREE.RepeatWrapping;
    newTexture.wrapT = THREE.RepeatWrapping;
    newTexture.repeat.set( 50, 50 );

    plane.material.map = newTexture;
    plane.material.needsUpdate = true;
}

let plane = new THREE.Mesh( geometry, material );
plane.rotateX(Math.PI/2);
scene.add( plane );

// set default texture
updateTexture("/sceneData/materials/a959431cb3cf5f04c7e22bac4c2ef7e7.jpg");

function updatePlane(payload){
    switch(payload.type){
        case eventEmitterConstants.CHANGE_PLANE_TEXTURE: {
            updateTexture(payload.src);
            break;
        }
    }
}

export {
    updatePlane
}