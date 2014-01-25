var app = {}

app.init = function(){

    app.scene = new THREE.Scene();
    app.renderer = new THREE.WebGLRenderer();
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.renderer.domElement);

    app.requestPointerLock = app.renderer.domElement.requestPointerLock ||
                 app.renderer.domElement.mozRequestPointerLock ||
                 app.renderer.domElement.webkitRequestPointerLock;

    app.exitPointerLock = document.exitPointerLock ||
                document.mozExitPointerLock ||
                document.webkitExitPointerLock;

    app.renderer.domElement.onclick = app.requestPointerLock;

    app.keyboard = new THREEx.KeyboardState();

    app.camera = new Camera();
    app.cube = new Cube();

    app.scene.add(app.cube.cube);

    app.camera.camera.position.z = 5;

    app.render();
};

app.animate = function(){
    requestAnimationFrame( app.animate );
    app.render();
    app.update();
}

app.update = function(){
    if( app.keyboard.pressed("a") ){
        app.cube.rotateLeft();
    }
    if( app.keyboard.pressed("d") ){
        app.cube.rotateRight();
    }
    if( app.keyboard.pressed("w") ){
        app.cube.rotateUp();
    }
    if( app.keyboard.pressed("s") ){
        app.cube.rotateDown();
    }

    if( app.keyboard.pressed("left") ){
        app.camera.moveLeft();
    }
    if( app.keyboard.pressed("right") ){
        app.camera.moveRight();
    }
    if( app.keyboard.pressed("up") ){
        app.camera.moveUp();
    }
    if( app.keyboard.pressed("down") ){
        app.camera.moveDown();
    }
}

app.render = function() {
    app.renderer.render(app.scene, app.camera.camera);
}



window.onload = function(){
    app.init();
    app.animate();
};

