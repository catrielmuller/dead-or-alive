var app = {}

app.init = function(){
	
	app.scene = new THREE.Scene();

	app.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

	app.renderer = new THREE.WebGLRenderer();
	app.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(app.renderer.domElement);


	var geometry = new THREE.CubeGeometry(1,1,1);
	var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
	app.cube = new THREE.Mesh(geometry, material);
	
	app.scene.add(app.cube);

	app.camera.position.z = 5;

	app.render();
};


app.render = function(){
	requestAnimationFrame(app.render);

	app.cube.rotation.x += 0.1;
	app.cube.rotation.y += 0.1;

	app.renderer.render(app.scene, app.camera);
}


window.onload=function(){
	app.init();
};

