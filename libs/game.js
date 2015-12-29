/*global THREE requestAnimationFrame*/
var CAR = CAR || {};

var scene = new THREE.Scene();
var world = new CAR.world(scene);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
var keys = new CAR.Controls();
var car = new CAR.car();
var loadingCanvas = document.createElement('div');
	
CAR.game = function()
{
	this.currentGate = 0;
	
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
	
	var scale = 4.58/15.18;
	// var scale = 1;
	car.load("res/models/save.json", scene, true, startGame, {scale});
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
	
	camera.position.set(0,2.5,0);
	car.rotation.y = Math.PI;
    car.cubeCamera.updateCubeMap( renderer, scene ); 
	
	function render() {
		requestAnimationFrame(render);
		
        //cubeCamera generuje envMap czyli odbicia na samochodzie. Generowane jest to na podstawie całej sceny i jeśli nie wylaczy sie auta przed update to w odbiciu będą widoczne elementy auta
        //car.dae.visible = false; // *cough*
//        car.cubeCamera.updateCubeMap( renderer, scene ); 
        //car.dae.visible = true; // *cough*
		
		var dt = clock.getDelta();
		car.move(keys, camera, dt);
		world.update(car, camera, dt);
		checkCollisionWithGate();
		
		// Camera position handling, including speed-dependent effects
		camera.rotation.y = car.cameraAngleY + Math.PI;
		camera.position.x = car.position.x - (8.0 + car.cameraSpeedMove * 20) * Math.sin(camera.rotation.y);
		camera.position.y = 2.5 + car.cameraPositionY * 5;
		// camera.position.y = 20;
		// camera.position.z = car.position.z;
		// camera.position.x = car.position.x;
		camera.position.z = car.position.z - (8.0 + car.cameraSpeedMove * 20) * Math.cos(camera.rotation.y);// + car.carAcc;
		camera.lookAt(car.position);
		
		renderer.render(scene, camera);
	}
	
	this.currentGate = 1;
	
	world.checkPointsList[this.currentGate].parent.visible = true;
	var carBB;
	
	render();
	
	function checkCollisionWithGate()
	{
		function getVertices(box)
		{
			var verts = [];
			verts[0] = new THREE.Vector3(box.max.x, box.max.y, box.max.z);
			verts[1] = new THREE.Vector3(box.max.x, box.max.y, box.min.z);
			verts[2] = new THREE.Vector3(box.max.x, box.min.y, box.max.z);
			verts[3] = new THREE.Vector3(box.max.x, box.min.y, box.min.z);
			verts[4] = new THREE.Vector3(box.min.x, box.max.y, box.max.z);
			verts[5] = new THREE.Vector3(box.min.x, box.max.y, box.min.z);
			verts[6] = new THREE.Vector3(box.min.x, box.min.y, box.max.z);
			verts[7] = new THREE.Vector3(box.min.x, box.min.y, box.min.z);
			return verts;
		}
		
		function getCenterOfBB(boundingBox)
		{
			var centX = (boundingBox.box.max.x + boundingBox.box.min.x)/2;
			var centY = (boundingBox.box.max.y + boundingBox.box.min.y)/2;
			var centZ = (boundingBox.box.max.z + boundingBox.box.min.z)/2;
			boundingBox.center = new THREE.Vector3(centX, centY, centZ);
		}
		
		world.hitText = "";
		carBB = new THREE.BoundingBoxHelper(car.dae);
		carBB.update();
		var carBBVerts = getVertices(carBB.box);
		getCenterOfBB(carBB);
		
		for(var vertexIndex=0; vertexIndex < carBBVerts.length; vertexIndex++)
		{
			var localVertex = carBBVerts[vertexIndex].clone();
			var directionVector = localVertex.sub(carBB.center);
		    
		    var ray = new THREE.Raycaster(carBB.center, directionVector.clone().normalize() );
		    var collisionResults = ray.intersectObject(world.checkPointsList[this.currentGate]);
		    if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
		    {
		        world.checkPointsList[this.currentGate].parent.visible = false;
		        this.currentGate++;
		        world.checkPointsList[this.currentGate].parent.visible = true;
		    }
		}
	}
};