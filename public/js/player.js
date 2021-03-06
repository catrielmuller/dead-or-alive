
function Player ( data, model_manager ) {
    var self = this;
    if ( data && model_manager ){
        self.init(data, model_manager);
    }
}

Player.prototype.init = function ( data, model_manager ){
    this.hash = data['hash'];
    this.name = data['name'];
    this.model = data['model'];

    this.model_manager = model_manager;
    this.loaded = false;
    this.model_manager.load_model(this.model, this);

    this.player_object = new THREE.Object3D();
}

Player.prototype.load_mesh = function ( ){
    var self = this;
    var geometry = self.model_manager.get_geometry( self.model );
    var materials = self.model_manager.get_materials( self.model );
    self.mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
    self.mesh.rotation.y = Math.PI;
    self.player_object.add( self.mesh );
    app.scene.add( self.player_object );
    self.loaded = true;
}

Player.prototype.update = function ( data ){
    var self = this;

    if ( self.loaded ){
        // Do stuff
    }
    else{
        console.log("NOT LOADED YET");
    }
}

Player.prototype.getObject = function ( ){
    var self = this;
    return self.player_object;
}

Player.prototype.update_position = function ( position ){
    var self = this;
    self.player_object.position = position;
}

Player.prototype.update_rotation = function ( rotation ){
    var self = this;
    self.player_object.rotation.y = rotation.y;
}

Player.prototype.remove = function ( ){
    var self = this;
    app.scene.remove( self.player_object );
}


function MainPlayer ( data, model_manager ) {
    var self = this;
    var timestamp = Math.round(+new Date()/100);
    this.hash = timestamp.toString(36).toUpperCase();
    this.name = data['name'];
    this.model = data['model'];

    this.model_manager = model_manager;
    this.loaded = false;
    this.model_manager.load_model(this.model, this);

    this.controls = new THREE.PointerLockControls( app.camera );

    this.player_object = new THREE.Object3D();
    this.player_object.position.z = -8;
    this.player_object.position.y = -1.5;
    this.controls.getObject().add(this.player_object);

    this.time = Date.now();

    this.die = false;

    this.ray_b = new THREE.Raycaster();
    this.ray_b.ray.direction.set( 0, -1, 0 );

    document.addEventListener( 'click', function (){
        self.fire();
    }, false );
}

MainPlayer.prototype = new Player( );

MainPlayer.prototype.load_mesh = function ( ){
    // MP load_mesh
    var self = this;
    var geometry = self.model_manager.get_geometry( self.model );
    var materials = self.model_manager.get_materials( self.model );

    self.mesh = new THREE.SkinnedMesh( geometry, new THREE.MeshFaceMaterial( materials ), false );
    self.mesh.rotation.y = Math.PI;
    self.player_object.add( self.mesh );

    app.scene.add( self.controls.getObject() );
    self.loaded = true;

    //self.animate(self.mesh);
}

MainPlayer.prototype.animate = function(mesh){

    var self = this;

    var materials = mesh.material.materials;

    for (var k in materials) {
        materials[k].skinning = true;
    }

    for (var i = mesh.geometry.animations.length - 1; i >= 0; i--) {
        THREE.AnimationHandler.add(mesh.geometry.animations[i]);
    };

    //THREE.AnimationHandler.add(mesh.geometry.animations);
    self.animation = new THREE.Animation(mesh, "Corre", THREE.AnimationHandler.CATMULLROM);
    self.animation.play();

}

MainPlayer.prototype.enable_controls = function ( ){
    var self = this;
    self.controls.enabled = true;

}

MainPlayer.prototype.disable_controls = function ( ){
    var self = this;
    self.controls.enabled = false;
}

MainPlayer.prototype.changelife = function (){

    var self = this;

    if(self.die){
        self.die = false;
        self.player_object.rotation.z = 0;
        self.controls.change_invert(false);
    }
    else {
        self.die = true;
        self.player_object.rotation.z = Math.PI;
        self.controls.change_invert(true);
    }
}


MainPlayer.prototype.update = function ( data ){
    var self = this;

    //console.log(self);

    if ( self.loaded ){

        // XXX: This is used for 'Gravity'
        self.controls.isOnObject( false );

        self.ray_b.ray.origin.copy( self.controls.getObject().position );

        if(self.die){
            this.ray_b.ray.direction.set( 0, 1, 0 );
            self.ray_b.ray.origin.y += 10;
        }
        else {
            this.ray_b.ray.direction.set( 0, -1, 0 );
            self.ray_b.ray.origin.y -= 10;
        }



        var intersections = self.ray_b.intersectObjects( [app.scene_base] );

        if ( intersections.length > 0 ) {
            var distance = intersections[ 0 ].distance;

            if ( distance > 0 && distance < 10 ) {
                self.controls.isOnObject( true );
            }
        }
        self.controls.update( Date.now() - self.time);
        self.time = Date.now();

        var delta = app.clock.getDelta();
        //self.animation.update( delta );
    }
    else{
        console.log("NOT LOADED YET");
    }
}

MainPlayer.prototype.data_to_server = function ( ){
    var self = this;
    var position = self.controls.getObject().position;
    var rotation = self.controls.getObject().rotation;
    return {'hash': self.hash,
            'position':{'x':position.x,
                        'y':position.y,
                        'z':position.z},
            'rotation':{'x':rotation.x,
                        'y':rotation.y,
                        'z':rotation.z},
            'name': self.name,
            'model': self.model}

}

MainPlayer.prototype.fire = function ( ){
    var self = this;
    if (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement ) {
        // Pointer was is locked, fire
        var bullet = new Bullet(self.controls.getObject(), self.model_manager);
    }
}
