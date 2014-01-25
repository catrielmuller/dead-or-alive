function Cube() {
    var geometry = new THREE.CubeGeometry(1,1,1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    this.cube = new THREE.Mesh(geometry, material);

    this.rotate_factor = 0.1;

    this.rotateRight = function (){
        this.cube.rotation.y += this.rotate_factor;
    };

    this.rotateLeft = function (){
        this.cube.rotation.y -= this.rotate_factor;
    };

    this.rotateUp = function (){
        this.cube.rotation.x -= this.rotate_factor;
    };

    this.rotateDown = function (){
        this.cube.rotation.x += this.rotate_factor;
    };


}
