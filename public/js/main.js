var app = {}

function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}



app.isconnect = false;

app.initsocket = function(){

    app.socket = io.connect('localhost');

    app.socket.on('connect', function(){

        if(!app.isconnect){
            app.isconnect = true;

            var timestamp = Math.round(+new Date()/1000);
            var code = timestamp.toString(36).toUpperCase();
            app.me.code = code;

            console.log('Code: ' + app.me.code);

            app.socket.emit('addplayer', app.me);

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
    app.socket.emit('meupdate', app.me.code, app.me);
}

app.players = {};
app.me = {};

var model = get('model');

if ( model !== undefined ){
    app.me.model = model;
}
else{
    app.me.model = 'pj';
}

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
    function loadMesh( geometry, materials ){
        app.players[player.code] = player;
        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
/*
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 2;
        mesh.position.x = -30;*/
        app.scene.add( mesh );

        app.players[player.code].element = mesh;
    }

    if(player.code != app.me.code){
        if ( ! (player.model in app.models) ){

            var loader = new THREE.JSONLoader();
            loader.load( '/models/'+player.model+'.js', function ( geometry, materials ) {

                //app.shader = ShaderExtras["hatching"];
        //         app.shader = THREE.ShaderLib["lambert"];
        //         var u = THREE.UniformsUtils.clone(app.shader.uniforms);
        //         var vs = app.shader.vertexShader;
        //         var fs = app.shader.fragmentShader;
        //
        //         var smaterial = new THREE.ShaderMaterial({ uniforms: u, vertex_shader: vs,  fragment_shader: fs , });

                //smaterial.uniforms.uDirLightPos.value = app.directionalLight.position;
                //smaterial.uniforms.uDirLightColor.value = app.directionalLight.color;
        //         smaterial.wireframe = true;

        //         console.log(smaterial);

        //         morph = new THREE.Mesh( geometry, smaterial );

                app.models[player.model] = {'geometry': geometry, 'materials': materials};
                var mesh = loadMesh( geometry, materials );

            });
        }
        else{
            var model = app.models[player.model];
            loadMesh( model['geometry'], model['materials'] );
        }

    }

}

app.updateplayer = function(player){

    if(app.players[player.code] != undefined){


        if(player.position != undefined){

            app.players[player.code].position = player.position;
            app.players[player.code].rotation = player.rotation;

            app.players[player.code].element.position.x = player.position.x;
            app.players[player.code].element.position.y = player.position.y;
            app.players[player.code].element.position.z = player.position.z;

            app.players[player.code].element.rotation.x = player.rotation.x;
            app.players[player.code].element.rotation.y = player.rotation.y;
            app.players[player.code].element.rotation.z = player.rotation.z;
            //console.log('UP!')

        }

    }

}

app.init = function(){

    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

	app.scene = new THREE.Scene();

    app.controls = new THREE.PointerLockControls( app.camera );
    app.scene.add( app.controls.getObject() );

    app.renderer = new THREE.WebGLRenderer({antialias:true});
    app.renderer.autoClear = true;
    app.renderer.setClearColor(0xffffff, 1);
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

    var loader = new THREE.JSONLoader();
    loader.load( '/scenes/base.js', function ( geometry, materials ) {

        app.scene_base =  new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        app.scene_base.scale.x = app.scene_base.scale.y = app.scene_base.scale.z = 7;
        app.scene_base.position.y = 0;
        app.scene_base.position.x = -150;
        app.scene.add( app.scene_base  );


    });


/*
    var geometry = new THREE.CubeGeometry(20,20,20);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});*/

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

    app.models = {};
/*
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

//         app.scene.add( morph );

    });*/
/*
    app.camera.position.y = -10;
    app.camera.position.z = 30;
    app.camera.position.x = 0;*/
/*
    app.render();*/
// floor

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
    //app.scene.add( mesh );

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
    app.me.rotation = {'x': app.controls.getObject().rotation.x,
                       'y': app.controls.getObject().rotation.y,
                       'z': app.controls.getObject().rotation.z};

    app.pushmetoserver();

    app.stats.update();
}

app.render = function() {
    app.renderer.render(app.scene, app.camera);
}


window.onload = function(){
    app.init();
    app.animate();
};

