const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

camera.position.set( 500, 800, 1300 );
camera.lookAt( new THREE.Vector3() );

export default camera;