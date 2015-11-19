/*global THREE*/
var CAR = CAR || {};

CAR.world = function(scene) 
{
	//scene.fog = new THREE.Fog(0xE08748, 1, 50);
	var textureLoader = new THREE.TextureLoader();
    //Lights
    var hemLight = new THREE.HemisphereLight(0xFFFFFF, 0xFF0000, 0.6);
    //hemLight.castShadow = true;
	//scene.add(hemLight);
	
	
	var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
	dirLight.shadowCameraNear = 1;
	dirLight.shadowCameraFar = 150;
	dirLight.shadowCameraTop = 100;
	dirLight.shadowCameraBottom = -100;
	dirLight.shadowCameraLeft = -100;
	dirLight.shadowCameraRight = 100;
	dirLight.castShadow = true;
	dirLight.shadowMapWidth = 4096;
	dirLight.shadowMapHeight = 4096;
	var helper = new THREE.CameraHelper(dirLight.shadow.camera);
	scene.add(helper);
	scene.add(dirLight);
	
	//Grass
	var w = 1200, h = 1200;
	var floorTex = textureLoader.load("res/grass.jpg");
	floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
	floorTex.repeat.set(1200, 1200);
	var floorMat = new THREE.MeshBasicMaterial({ map: floorTex });
	var floorGeo = new THREE.PlaneGeometry(w, h);
	var floor = new THREE.Mesh(floorGeo, floorMat);
	floor.receiveShadow = true;
	scene.add(floor);
	
	//Road
	var asphaltTex = textureLoader.load("res/asphalt.jpg");
	asphaltTex.wrapS = asphaltTex.wrapT = THREE.RepeatWrapping;
	asphaltTex.repeat.set(1, 40);
	var asphaltMat = new THREE.MeshBasicMaterial({ map: asphaltTex });
	var asphlatGeo = new THREE.PlaneGeometry(15, h);
	var asphalt = new THREE.Mesh(asphlatGeo, asphaltMat);
	asphalt.shading = THREE.FlatShading;
	asphalt.receiveShadow = true;
	asphalt.castShadow = false;
	scene.add(asphalt);
	
	//Skybox
	var urlPrefix = "res/skybox/jajsundown1_";
	var urls = 
		[urlPrefix + "left.jpg", urlPrefix + "right.jpg",
    	urlPrefix + "top.jpg", urlPrefix + "top.jpg",
    	urlPrefix + "back.jpg", urlPrefix + "front.jpg"];
	var textureCube = THREE.ImageUtils.loadTextureCube(urls);
	var shader = THREE.ShaderLib["cube"];
	var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
	uniforms['tCube'].value = textureCube;   // textureCube has been init before
	var material = new THREE.ShaderMaterial({
		fragmentShader    : shader.fragmentShader,
    	vertexShader  : shader.vertexShader,
    	uniforms  : uniforms,
		depthWrite : false
		});
	material.side = THREE.BackSide;
	// build the skybox Mesh 
	var skybox    = new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000, 1, 1, 1), material);
	skybox.doubleSided = true;
	// add it to the scene
	scene.add(skybox);
	
	//Test
	var cyl = new THREE.CylinderGeometry(1, 1.8, 5);
	var materialC = new THREE.MeshBasicMaterial({ color:0x0019BF });
	var cyl1 = new THREE.Mesh(cyl, materialC);
	var cyl2 = new THREE.Mesh(cyl, materialC);
	cyl1.castShadow = true;
	cyl2.castShadow = true;
	
	var torTex = textureLoader.load("res/test.jpg");
	var torGeo = new THREE.TorusGeometry(15, 2, 10, 50);
	//var torMat = new THREE.MeshLambertMaterial({ color: 0x293899 });
	var torMat = new THREE.MeshBasicMaterial({ map: torTex, wireframe: false });
	
	var tor1 = new THREE.Mesh(torGeo, torMat);
	tor1.position.set(0,0,0);
	tor1.castShadow = true;
	
	scene.add(tor1);
	scene.add(cyl1);
	scene.add(cyl2);
	
	var boxGeo = new THREE.BoxGeometry(5,5,5);
	var box = new THREE.Mesh(boxGeo, materialC);
	box.position.set(-5,2,-5);
	box.castShadow = true;
	scene.add(box);
	
	cyl1.position.set(10, 0, 0);
	cyl2.position.set(-10, 0, 0);
	
	//Update position
	floor.rotation.x = asphalt.rotation.x = Math.PI * -90 / 180;
	asphalt.position.y += 0.005;
	
	var text2 = document.createElement('div');
	text2.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	text2.style.width = 500;
	text2.style.height = 100;
	//text2.style.backgroundColor = "blue";
	text2.style.top = 10 + 'px';
	text2.style.left = 10 + 'px';
	text2.style.textShadow = "#000 0px 0px 5px";
	text2.style.fontSize = "12px";
	text2.style.color = "white";
	document.body.appendChild(text2);

	this.update = function(car, camera) {
		var position = car.position;
		
		//car.position.z  = 0
		floor.position.x = position.x - position.x % (floorGeo.parameters.width / floorTex.repeat.x);
		floor.position.z = position.z - position.z % (floorGeo.parameters.height / floorTex.repeat.y);
		asphalt.position.z = position.z - position.z % (asphlatGeo.parameters.height / asphaltTex.repeat.y);
		dirLight.position.x = position.x + 10;
		dirLight.position.z = position.z - 10;
		dirLight.position.y = position.y + 10;
		dirLight.target = car;
		
		var speed = car.carSpeed * 3600 / 1000;
		var acc = car.carAcc / 9.8;
		text2.innerHTML = "Speed (km/h): " + speed + "<br />" + "Acceleration (g): " + acc + 
						"<br />RPM/Gear: " + car.rpm + "/" + car.gear;
	};
};