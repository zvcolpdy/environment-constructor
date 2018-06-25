import renderer from './mainParts/Renderer'
import camera from './mainParts/Camera'
import {scene} from './mainParts/Scene'

const render = function () {
    renderer.render(scene, camera);
};

const controls = new THREE.OrbitControls( camera, renderer.domElement );

const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

function animate() {
    stats.begin();
    renderer.render(scene, camera );
    stats.end();

    requestAnimationFrame( animate );
}

requestAnimationFrame( animate );

export {controls}
export default render