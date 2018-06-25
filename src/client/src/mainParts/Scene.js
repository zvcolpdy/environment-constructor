let scene = new THREE.Scene();

// light options
var light = new THREE.HemisphereLight( 0x000000, 0x444444, 7);
scene.add( light );
light.position.set( 500, 800, 1300);


var light1 = new THREE.HemisphereLight( 0x000000, 0x444444, 2);
scene.add( light1 );
light1.position.set( -500, 800, 1300);

// exes
// var axesHelper = new THREE.AxesHelper( 150 );
// scene.add( axesHelper );

scene.background = new THREE.Color( 0xf0f0f0 );
scene.fog = new THREE.Fog( 0xf0f0f0, 500, 3000 );

export {
    scene
}
export default scene;