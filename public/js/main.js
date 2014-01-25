var app = {}

app.init = function(){
	
    app.clock = new THREE.Clock();
	app.scene = new THREE.Scene();

    app.renderer = new THREE.WebGLRenderer();
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.renderer.domElement);

    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

    app.controls = new THREE.FirstPersonControls(app.camera);
    app.controls.movementSpeed = 10;
    app.controls.lookSpeed = 0.10;
    app.controls.lookVertical = true;


    app.requestPointerLock = app.controls.domElement.requestPointerLock ||
                 app.controls.domElement.mozRequestPointerLock ||
                 app.controls.domElement.webkitRequestPointerLock;


    app.exitPointerLock = document.exitPointerLock ||
                document.mozExitPointerLock ||
                document.webkitExitPointerLock;

    app.renderer.domElement.onclick = app.requestPointerLock;



    app.cube = new Cube();

    app.scene.add(app.cube.cube);

    app.camera.position.z = 5;

    app.render();
    app.renderer.domElement.webkitRequestPointerLock()
};

app.animate = function(){
    requestAnimationFrame( app.animate );
    app.render();
    app.update();
}


app.update = function(){
    var delta = app.clock.getDelta();
    app.controls.update(delta);

    /*
    if( app.keyboard.pressed("1") ){
        app.cube.rotateLeft();
    }
    if( app.keyboard.pressed("2") ){
        app.cube.rotateRight();
    }
    if( app.keyboard.pressed("3") ){
        app.cube.rotateUp();
    }
    if( app.keyboard.pressed("4") ){
        app.cube.rotateDown();
    }
    */
    
}

app.render = function() {
    app.renderer.render(app.scene, app.camera);
}



window.onload = function(){
    app.init();
    app.animate();
};

