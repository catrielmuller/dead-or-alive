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

            app.socket.emit('addplayer', code);

        }

    });

    app.socket.on('log', function(logdata){
        console.log('IO: ' + logdata);
    });

    app.socket.on('listplayers', function(listplayers){
        app.create_players(listplayers);
    });

    app.socket.on('playerupdate', function(player){
        app.updateplayer(player);
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

        if(listplayers[i].code != app.code){
            app.players[listplayers[i].code] = listplayers[i];
            app.players[listplayers[i].code].element = new THREE.Mesh(app.def_geometry, app.def_material);

            app.scene.add(app.players[listplayers[i].code].element);    
        }        
        
    };

}

app.updateplayer = function(player){

    if(app.players[player.code] != undefined){

        
        if(player.position != undefined){

            app.players[player.code].position = player.position;

            app.players[player.code].element.position.x = player.position.x;
            app.players[player.code].element.position.y = player.position.y;
            app.players[player.code].element.position.z = player.position.z;

        }

    }

}

app.init = function(){

    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);

	app.scene = new THREE.Scene();

    app.controls = new THREE.PointerLockControls( app.camera );
    app.scene.add( app.controls.getObject() );

    app.renderer = new THREE.WebGLRenderer();
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.renderer.domElement);

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

    app.cubes = []

    for ( var i = 0; i < 10; i ++ ) {
        var cube = new THREE.Mesh(geometry, material);
        cube.position.x = i*40;
        cube.position.y = 0;
        cube.position.z = 0;

        app.cubes.push(cube);
        app.scene.add(cube);
    }


    //app.camera.position.y = -10;
    //app.camera.position.z = 5;
    //app.camera.position.x = -10;

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

    app.me.position = app.camera.position;

    app.pushmetoserver();

}

app.render = function() {
    app.renderer.render(app.scene, app.camera);
}


window.onload = function(){
    app.init();
    app.animate();
};

