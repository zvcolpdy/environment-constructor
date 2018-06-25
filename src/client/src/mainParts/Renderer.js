const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight - 80 );
document.body.appendChild( renderer.domElement );

export default renderer;