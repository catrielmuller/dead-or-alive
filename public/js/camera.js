function Camera() {

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

    this.rotate_factor = 0.1;
    this.move_factor = 0.1;

    this.rotateRight = function (){
        this.camera.rotation.x += this.rotate_factor;
    };

    this.rotateLeft = function (){
        this.camera.rotation.x -= this.rotate_factor;
    };

    this.rotateUp = function (){
        this.camera.rotation.y += this.rotate_factor;
    };

    this.rotateDown = function (){
        this.camera.rotation.y -= this.rotate_factor;
    };

    this.moveRight = function (){
        this.camera.position.x += this.move_factor;
    };

    this.moveLeft = function (){
        this.camera.position.x -= this.move_factor;
    };

    this.moveUp = function (){
        this.camera.position.y += this.move_factor;
    };

    this.moveDown = function (){
        this.camera.position.y -= this.move_factor;
    };

    this.moveFw = function (){
        this.camera.position.z += this.move_factor;
    };

    this.moveBw = function (){
        this.camera.position.z -= this.move_factor;
    };


}
