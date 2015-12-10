/*global THREE requestAnimationFrame*/
var CAR = CAR || {};

var scene = new THREE.Scene();
var world = new CAR.world(scene);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
var keys = new CAR.Controls();
var car = new CAR.car();
var loadingCanvas = document.createElement('div');
	
CAR.game = function()
{
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.shadowMap.enabled = true;
	//renderer.shadowCameraFov = 60;
	
	//renderer.shadowMapBias = 0.0039;
	//renderer.shadowMapDarkness = 0.9;
	//renderer.shadowMapWidth = 1024;
	//renderer.shadowMapHeight = 1024;
	
	//controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	loadingCanvas.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	loadingCanvas.style.width = 500;
	loadingCanvas.style.height = 100;
	//text2.style.backgroundColor = "black";
	loadingCanvas.style.top = 10 + 'px';
	loadingCanvas.style.left = 10 + 'px';
	loadingCanvas.style.textShadow = "#000 0px 0px 5px";
	loadingCanvas.style.fontSize = "50px";
	loadingCanvas.style.color = "white";
	loadingCanvas.style.visibility = true;
	loadingCanvas.innerHTML = "Loading...";
	document.body.appendChild(loadingCanvas);
	
	window.addEventListener('resize', function() 
	{
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}, false);
	
	car.load(scene, startGame, "");
};

function start()
{
	var game = new CAR.game();
}

var startGame = function() 
{
	document.body.appendChild(renderer.domElement);
	loadingCanvas.style.display = 'none';
	var clock = new THREE.Clock();
	
	//Uncomment after implementing loading from JSON
	//scene.add(car);
	
	camera.position.set(0,2.5,0);
	//camera.rotation.y = Math.PI;
	
	function render() {
		requestAnimationFrame(render);
		var dt = clock.getDelta();
		car.move(keys, camera, dt);
		world.update(car, camera, dt);
		checkCollision();
		
		// Camera position handling, including speed-dependent effects
		camera.rotation.y = car.cameraAngleY + Math.PI;
		camera.position.x = car.position.x - (8 + car.cameraSpeedMove * 20) * Math.sin(camera.rotation.y);
		camera.position.y = 2.5 + car.cameraPositionY * 5;
		// camera.position.y = 20;
		// camera.position.z = car.position.z;
		// camera.position.x = car.position.x;
		camera.position.z = car.position.z - (8 + car.cameraSpeedMove * 20) * Math.cos(camera.rotation.y);// + car.carAcc;
		camera.lookAt(car.position);
		
		renderer.render(scene, camera);
	}
	render();
	var carBox;
	function checkCollision()
	{
		world.hitText = "";
		var carBB = new THREE.Box3().setFromObject(car.dae);
		for (var colidObj = 0; colidObj < world.collidableMeshList.length; colidObj++)
		{		
			if (world.collidableMeshList[colidObj].isIntersectionBox(carBB))
				world.hitText = "Hit!";
		}	
	}
};