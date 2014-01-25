var app = {}

app.isconnect = false;

app.initsocket = function(){

    app.socket = io.connect('192.168.1.28');

    app.socket.on('connect', function(){

        if(!app.isconnect){
            app.isconnect = true;

            var timestamp = Math.round(+new Date()/1000);
            var code = timestamp.toString(36).toUpperCase();
            app.code = code;

            console.log('Code: ' + app.code);

            app.socket.emit('addplayer', code);

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
    app.socket.emit('meupdate', app.code, app.me);
}

app.players = {};
app.me = {};

app.def_geometry = new THREE.CubeGeometry(1,1,1);
app.def_material = new THREE.MeshBasicMaterial({color: 0x00ff00});

app.create_players = function(listplayers){

    for(var i in listplayers){

        var player = listplayers[i];
        app.new_player(player);
        
    };
}

app.remove_player = function(playercode){

    if(app.players[playercode] != undefined){
        app.scene.remove(app.players[playercode].element);    
        delete app.players[playercode];

    }

}

app.new_player = function(player){

    console.log(player);

    if(player.code != app.code){
        app.players[player.code] = player;
        app.players[player.code].element = new THREE.Mesh(app.def_geometry, app.def_material);

        app.scene.add(app.players[player.code].element);    
    }

}

app.updateplayer = function(player){

    if(app.players[player.code] != undefined){

        
        if(player.position != undefined){

            app.players[player.code].position = player.position;

            app.players[player.code].element.position.x = player.position.x;
            app.players[player.code].element.position.y = player.position.y;
            app.players[player.code].element.position.z = player.position.z;

            //console.log('UP!')

        }

    }

}

app.init = function(){

    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);

	app.scene = new THREE.Scene();

    app.controls = new THREE.PointerLockControls( app.camera );
    app.scene.add( app.controls.getObject() );

    app.renderer = new THREE.WebGLRenderer({antialias:true});
    app.renderer.autoClear = false;
    app.renderer.setClearColorHex( 0xffffff, 1 );
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.renderer.domElement);

    app.stats = new Stats();
    app.stats.domElement.style.position = 'absolute';
    app.stats.domElement.style.top = '0px';
    document.body.appendChild( app.stats.domElement );

    app.time = Date.now();

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

        var element = document.body;

        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                app.controls.enabled = true;


            } else {

                app.controls.enabled = false;

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

    var geometry = new THREE.CubeGeometry(20,20,20);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});

    //app.cubes = []

    /*

    for ( var i = 0; i < 10; i ++ ) {
        var cube = new THREE.Mesh(geometry, material);
        cube.position.x = i*40;
        cube.position.y = 0;
        cube.position.z = 0;

        app.cubes.push(cube);
        app.scene.add(cube);
    }

    */

    /*TEST */

    app.scene.add( new THREE.AmbientLight( 0x111111 ) );

    app.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8 );

    app.directionalLight.position.x = 0;
    app.directionalLight.position.y = 25;
    app.directionalLight.position.z = 25;

    app.directionalLight.position.normalize();

    app.scene.add( app.directionalLight );
    
    var loader = new THREE.JSONLoader();
    loader.load( '/models/pj.js', function ( geometry, materials ) {

        //app.shader = ShaderTest["hatching"];
        //app.shader = THREE.ShaderLib["lambert"];
        //app.shader_u = THREE.UniformsUtils.clone(app.shader.uniforms);
        //app.shader_vs = app.shader.vertex_shader;
        //app.shader_fs = app.shader.fragment_shader;

        //var smaterial = new THREE.ShaderMaterial({ uniforms: app.shader_u, vertexShader: app.shader_vs,  fragmentShader: app.shader_fs});

        //smaterial.uniforms.uDirLightPos.value = app.directionalLight.position;
        //smaterial.uniforms.uDirLightColor.value = app.directionalLight.color;
        
        //var morph = new THREE.Mesh( geometry, smaterial );

        var morph = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        morph.position.set( 0, 0, 0 );
        morph.scale.x = morph.scale.y = morph.scale.z = 2;

        app.scene.add( morph );

    });

    app.camera.position.y = -10;
    app.camera.position.z = 30;
    app.camera.position.x = 0;

    app.render();

    app.initsocket();

};

app.animate = function(){
    requestAnimationFrame( app.animate );
    app.render();
    app.update();
}


app.update = function(){
    app.controls.isOnObject( true );
    app.controls.update( Date.now() - app.time);
    app.time = Date.now();

    app.me.position = app.controls.getObject().position;

    app.pushmetoserver();

}

app.render = function() {
    app.renderer.render(app.scene, app.camera);
}


window.onload = function(){
    app.init();
    app.animate();
};

