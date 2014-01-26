var app = {}

function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}



app.isconnect = false;

app.initsocket = function(){
    var server = get('server');
    if ( server === undefined ){
        server = window.location.hostname;
    }

    app.socket = io.connect(server);

    app.socket.on('connect', function(){

        if(!app.isconnect){
            app.isconnect = true;
            var main_player = app.players[app.main_player];
            console.log('Code: ' + main_player.hash);
            app.socket.emit('addplayer', main_player.hash, main_player.data_to_server());

        }

    });

    app.socket.on('log', function(logdata){
        console.log('IO: ' + logdata);
    });

    app.socket.on('listplayers', function(listplayers){
        app.create_players(listplayers);
    });

    app.socket.on('playernew', function(player){
        app.new_player(player);
    });

    app.socket.on('playerupdate', function(player){
        app.updateplayer(player);
    });

    app.socket.on('playerdelete', function(playercode){
        app.remove_player(playercode);
    });

}

app.pushmetoserver = function(){
    var main_player = app.players[app.main_player];
    app.socket.emit('meupdate', main_player.hash, main_player.data_to_server());
}

app.create_players = function(listplayers){

    for(var i in listplayers){

        var data = listplayers[i];
        if ( data['hash'] != app.main_player ){
            app.new_player(data);
        }

    };
}

app.remove_player = function(playercode){

    if(app.players[playercode] != undefined){
        app.players[playercode].remove();
        delete app.players[playercode];

    }

}

app.new_player = function(data){

    console.log(data);
    var new_player = new Player( data, app.players_models );

    app.players[new_player['hash']] = new_player ;
    app.scene.add( new_player.getObject() );

}

app.updateplayer = function(data){

    if(app.players[data.hash] != undefined){

        var player = app.players[data.hash]

        player.update_position( data.position );
        player.update_rotation( data.rotation );
    }

}

app.setup_mouse_lock = function (){
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

        var element = document.body;

        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                app.players[app.main_player].enable_controls();
            } else {
                app.players[app.main_player].disable_controls();
            }

        }

        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        app.renderer.domElement.addEventListener( 'click', function ( event ) {

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            element.requestPointerLock();

        }, false );

    }
}

app.add_ambient_light = function (){

    app.ambientLight=new THREE.AmbientLight( 0x111111 )
        app.ambientLight.castShadow = true;
  /*  app.scene.add(app.ambientLight);*/
    app.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8 );

/*    app.directionalLight.position.x = 0;
    app.directionalLight.position.y = 25;
    app.directionalLight.position.z = 25;*/
    app.directionalLight.castShadow = true;
    app.directionalLight.position.normalize();
    app.directionalLight.position.set(-450, 400, 500);
    app.directionalLight.target.position.set(0, 0, 0);
    app.directionalLight.distance =10000;
    app.directionalLight.angle=0.5;
    app.scene.add( app.directionalLight );
}

app.add_floor = function (){

    geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

        var vertex = geometry.vertices[ i ];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;

    }

    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

        var face = geometry.faces[ i ];
        face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    }

    material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

    mesh = new THREE.Mesh( geometry, material );

    app.scene.add( mesh );
}

app.init = function(){
    app.server_time = Math.round(new Date()/50);

    app.clock = new THREE.Clock();

    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.01, 1000);

	app.scene = new THREE.Scene();

    app.players_models = new ModelsManager();

    app.players = {};
    app.bullets = {};

    var name = get('name');
    if ( name === undefined ){
        name = 'John Doe';
    }

    var model = get('model');
    if ( model === undefined ){
        model = 'pj';
    }

    var main_player = new MainPlayer( {'name': name, 'model': model}, app.players_models );

    app.main_player = main_player.hash;
    app.players[app.main_player] = main_player;

/*
    app.scene.add( main_player.getObject() );*/

    app.renderer = new THREE.WebGLRenderer({antialias:true,});
    app.renderer.autoClear = true;
    app.renderer.setClearColor(0x008ac4, 1);
    app.renderer.shadowMapEnabled = true;
    app.renderer.shadowMapSoft = true;

    app.renderer.shadowCameraNear = 3;
    app.renderer.shadowCameraFar = app.camera.far;
    app.renderer.shadowCameraFov = 50;

    app.renderer.shadowMapBias = 0.0039;
    app.renderer.shadowMapDarkness = 0.5;
    app.renderer.shadowMapWidth = 2048;
    app.renderer.shadowMapHeight = 2048;
    app.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(app.renderer.domElement);

    app.renderer.autoClear = false;

    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

    effectBloom = new THREE.BloomPass( 0.75 );
    var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

    hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
    vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

    var bluriness = 0;

    hblur.uniforms[ 'h' ].value = bluriness / window.innerWidth;
    vblur.uniforms[ 'v' ].value = bluriness /window.innerHeight;

    hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

    effectBleach.uniforms[ 'opacity' ].value = 0.65;

    composer = new THREE.EffectComposer( app.renderer, renderTarget );

    var renderModel = new THREE.RenderPass( app.scene, app.camera );

    vblur.renderToScreen = true;
	composer = new THREE.EffectComposer( app.renderer, renderTarget );

	composer.addPass( renderModel );

	composer.addPass( effectBloom );
				//composer.addPass( effectBleach );

	composer.addPass( hblur );
	composer.addPass( vblur );

    app.stats = new Stats();
    app.stats.domElement.style.position = 'absolute';
    app.stats.domElement.style.top = '0px';
    document.body.appendChild( app.stats.domElement );

    app.setup_mouse_lock();
    app.add_ambient_light();
//     app.add_floor();

    var loader = new THREE.JSONLoader();
    loader.load( '/scenes/base.js', function ( geometry, materials ) {

        app.scene_base =  new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        app.scene_base.scale.x = app.scene_base.scale.y = app.scene_base.scale.z = 7;
        app.scene_base.position.y = 0;
        app.scene_base.position.x = -150;
        app.scene_base.castShadow=true;
        app.scene_base.receiveShadow=true;
        app.scene.add( app.scene_base  );


    });
    app.initsocket();
};

app.animate = function(){
    requestAnimationFrame( app.animate );
    app.render();
    app.update();
}


app.update = function(){

    // XXX: Do not send on *EVERY* frame
    var server_time = Math.round(new Date()/50);
    if (server_time != app.server_time){
        app.pushmetoserver();
        app.server_time = server_time;
    }

    for(var i in app.players){
        app.players[i].update();
    }

    for(var i in app.bullets){
        app.bullets[i].update();
    }


    app.stats.update();
}

app.render = function() {
    //app.renderer.render(app.scene, app.camera);
    composer.render( 0.1 );
}


window.onload = function(){
    app.init();
    app.animate();
};

