
function Bullet ( reference, model_manager ) {
    var self = this;
    this.loaded = false;
    this.reference = reference;
    this.model_manager = model_manager;
    this.model = 'bullet';
    this.model_manager.load_model( this.model, this);

    this.bullet_object = new THREE.Object3D();
    app.bullets[this.bullet_object.uuid] = this;
}

Bullet.prototype.load_mesh = function ( ){
    var self = this;
    var geometry = self.model_manager.get_geometry( self.model );
    var materials = self.model_manager.get_materials( self.model );
    self.mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
    self.mesh.rotation.x = -Math.PI/2;
//     self.mesh.rotation.y = Math.PI;
    self.bullet_object.add( self.mesh );
    self.bullet_object.rotation.y = self.reference.rotation.y;
    self.bullet_object.position.x = self.reference.position.x;
    self.bullet_object.position.y = self.reference.position.y;
    self.bullet_object.position.z = self.reference.position.z;
    self.bullet_object.translateZ( -10 );
    self.bullet_object.add( self.mesh );
    app.scene.add( self.bullet_object );
    self.loaded = true;
    self.velocity = new THREE.Vector3();
}

Bullet.prototype.update = function ( ){
    var self = this;

    if ( self.loaded ){
        var speed = -5;

//         self.bullet_object.translateX( self.velocity.x );
        self.bullet_object.translateZ( speed );

        if ( Math.abs(self.bullet_object.position.x) > 400 ||
             Math.abs(self.bullet_object.position.y) > 400 ||
             Math.abs(self.bullet_object.position.z) > 400){
            self.remove();
        }
    }
}

Bullet.prototype.getObject = function ( ){
    var self = this;
    return self.bullet_object;
}

Bullet.prototype.remove = function ( ){
    var self = this;
    delete app.bullets[this.bullet_object.uuid];
    app.scene.remove( self.bullet_object );
}
