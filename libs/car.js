/*global THREE*/
var CAR = CAR || {};

var degToRad = function(deg)
{
    return deg * Math.PI / 180.0;
};

CAR.car = function(params)
{
    THREE.Object3D.call(this);
    
    this.brake = 0;
    this.brakingForce = -25000;
    this.cameraAngleY = 0;
	this.cameraDelay = 0.0;
	this.cameraPositionY;
	this.cameraSpeedMove;
    this.carAcc = 0;
    this.carMass = 1750;
    this.carSpeed = 0;
    this.carTurn = 0;
	this.castShadow = true;
    this.cx = 0.35;
	this.dae;
    this.engineTorque = 560;
    this.finalDrive = 3.71;
	this.fwRotationMatrix = new THREE.Vector3(0,0,0);
    this.gear = 1;
    this.gearRatios = [3.15, 1.95, 1.44, 1.15, 0.94, 0.76];
    this.loaded = false;
	this.objects = {};
    this.rpm = 0;
	this.throttle = 0;
	this.wheelBaseLength = 0;
	this.wheelBaseWidth = 0;
    this.wheelRadius = 0.3425;
    
    this.load = function(scene, startFunc)
	{
		var obj = this;
		var colladaLoader = new THREE.ColladaLoader();
		colladaLoader.load("res/models/db91.dae", function(collada)
		{
			obj.dae = collada.scene;
			obj.dae.traverse(function(child)
			{
				child.traverse(function(e)
				{
					e.caseShadow = true;
					e.receiveShadow = true;
					if (e.material instanceof THREE.MeshPhongMaterial)
					{
						e.material.needsUpdate = true;
					}	
				});
				if (child.colladaId == "w0"){
					child.traverse(function(e){
	                    obj.objects["flWheel"] = e;
					});
				}
				if (child.colladaId == "w1"){
					child.traverse(function(e){
	                    obj.objects["frWheel"] = e;
					});
				}
				if (child.colladaId == "w2"){
					child.traverse(function(e){
	                    obj.objects["rlWheel"] = e;
					});
				}
				if (child.colladaId == "w3"){
					child.traverse(function(e){
	                    obj.objects["rrWheel"] = e;
					});
				}
				if (child.colladaId == "badge"){
					child.traverse(function(e){
	                    obj.objects["badge"] = e;
					});
				}
				if (child.colladaId == "cover"){
					child.traverse(function(e){
	                    obj.objects["cover"] = e;
					});
				}
				if (child.colladaId == "glass"){
					child.traverse(function(e){
	                    obj.objects["glass"] = e;
					});
				}
				if (child.colladaId == "default"){
					child.traverse(function(e){
	                    obj.objects["default"] = e;
					});
				}
			});
			obj.dae.rotation.x += Math.PI/2;
            obj.dae.rotation.y += Math.PI;
			scene.add(obj.dae);
			
			obj.wheelBaseLength = obj.objects["flWheel"].parent.position.distanceTo(obj.objects["rlWheel"].parent.position);
			obj.wheelRadius = new THREE.Box3().setFromObject(obj.objects["flWheel"]).size().y/2;
			
			// Add all wheel to single array for easier accessing
			obj.objects["wheels"] = [];
			obj.objects["wheels"].push(obj.objects["flWheel"]);
			obj.objects["wheels"].push(obj.objects["frWheel"]);
			obj.objects["wheels"].push(obj.objects["rlWheel"]);
			obj.objects["wheels"].push(obj.objects["rrWheel"]);
			
            obj.objects["exceptWheels"] = [];
			obj.objects["exceptWheels"].push(obj.objects["default"]);
			obj.objects["exceptWheels"].push(obj.objects["glass"]);
			obj.objects["exceptWheels"].push(obj.objects["cover"]);
			obj.objects["exceptWheels"].push(obj.objects["badge"]);
			
			startFunc();
		});
		/*objLoader.load("res/models/rapide.obj", "res/models/rapide.mtl", function(loadedObj)
		{
			loadedObj.traverse(function(child)
			{
				if(child instanceof THREE.Mesh)
				{
					child.material = objMaterial;
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
			loadedObj.rotation.y = Math.PI;
			loadedObj.position.y += 0.13067;
			loadedObj.position.z = 1;
			obj.add(loadedObj)
			//scene.add(obj);
		});*/
	};
};

CAR.car.prototype = Object.create(THREE.Object3D.prototype);


CAR.car.prototype.move = function(keys, camera, dt)
{
	var cameraAmortization = 0.9;
	var prop = 0;
	var acceleration = 0;
	var fTraction = 0, fRr = 0, force = 0;
	var fDrag = 0;
	var rr = 30 * this.cx; //Rolling resistance
	var radiusChange = 0;
	var rotationRadius = 0;
	var maxTurn = 45;
	
	/////////// START Keyboard streering
	if (keys.pressed[37]) // Left arrow
	{
		if (this.carTurn > 0)
			this.carTurn -= dt;
		this.carTurn -= dt;
		if (this.carTurn < -1)
			this.carTurn = -1;
		if(this.carSpeed > 0.001){
			prop = dt * 10 / (this.carSpeed+10);
			if (prop > 1)
				prop = Math.sqrt(prop);
			//this.dae.rotation.z = this.rotation.y += 2.5 * prop * (-this.carTurn);
		}
	} 
	if (keys.pressed[39]) // Right arrow
	{
		if (this.carTurn < 0)
			this.carTurn += dt;
		this.carTurn += dt;
		if (this.carTurn > 1)
			this.carTurn = 1;
		if(this.carSpeed > 0.001){
			prop = dt * 10 / (this.carSpeed+10);
			if (prop > 1)
				prop = Math.sqrt(prop);
			//this.dae.rotation.z = this.rotation.y -= 2.5 * prop * this.carTurn;
		}
	}
	
	if (keys.pressed[38]) // Up arrow
	{
		if (this.throttle < 1)
			this.throttle += dt;
		else
			this.throttle = 1;
		if (this.carSpeed < 0)
			fTraction = this.brakingForce * this.throttle;
			
		this.brake = 0;
		fTraction = (this.engineTorque * this.gearRatios[this.gear-1] * this.finalDrive * 0.7 / this.wheelRadius) * this.throttle;
	}
	
	if (keys.pressed[40]) // Down arrow
	{
		if (this.carSpeed > 0)
		{
			if (this.brake < 1)
				this.brake += 2*dt;
			else
				this.brake = 1;
				
			this.throttle = 0;
			fTraction = this.brakingForce * this.brake;
		}
			
		else
			fTraction = 0;
	}
	
	if (!keys.pressed[38] && !keys.pressed[40])
	{
		fTraction = 0;
		if (this.throttle > 0)
			this.throttle -= dt;
		if (this.brake > 0)
			this.brake -= 2*dt;
	}
	/////////// END Keyboard
	
	fDrag = -this.cx * this.carSpeed * this.carSpeed;
	fRr = -rr * this.carSpeed;
	force = fTraction + fDrag + fRr;
	
	acceleration = force / this.carMass;
		
	this.carSpeed += acceleration * dt;
	if (this.carSpeed < 0 && keys.pressed[40])
		this.carSpeed = 0;
		
	this.rpm = this.calcRpm(this.carSpeed, this.gearRatios[this.gear-1], this.finalDrive, this.wheelRadius);
	if (this.rpm < 850 && this.gear == 1)
		this.rpm = 850;
	
	//Change gears depending on RPM
	if (this.rpm > 7000 && this.gear < 6)
		this.gear++;
	else if (this.rpm < 3000 && this.gear > 1)
		this.gear--;
	else if (this.gear == 6 && this.rpm > 6900)
		this.carSpeed -= acceleration * dt;
	
	var speedFactor = 6 / (this.carSpeed + 6);
	
	/////////// Camera
	this.cameraAngleY = this.rotation.y;
	this.cameraDelay = degToRad(maxTurn * speedFactor * this.carTurn);
	if(!keys.pressed[39] && !keys.pressed[37])
	{
		//this.cameraAngleY += this.cameraDelay;
		//this.cameraDelay = this.cameraDelay * cameraAmortization;
		//this.cameraAngleY -= this.cameraDelay;
		this.carTurn *= cameraAmortization;
	}
	this.cameraAngleY -= this.cameraDelay;
	/////////// END Camera
		
		
	var distanceTraveled = this.carSpeed * dt;
	if (this.carTurn == 0)
	{
		rotationRadius = 0;
		radiusChange = 0;
	}
	else
	{
		rotationRadius = this.wheelBaseLength / Math.sin(degToRad(maxTurn * speedFactor * this.carTurn));
		radiusChange = distanceTraveled / rotationRadius; // in radians
	}
	this.dae.rotation.z = this.rotation.y -= radiusChange;
	var phi = Math.PI - radiusChange/2.0 - Math.PI/2.0 + this.rotation.y;
	if (this.rotation.y == 0)
	{
		this.dae.position.x = this.position.x -= Math.sin(this.rotation.y) * this.carSpeed * dt;
		this.dae.position.z = this.position.z -= Math.cos(this.rotation.y) * this.carSpeed * dt;
	}
	else
	{
		this.dae.position.x = this.position.x += Math.cos(phi) * 2 * (Math.sin(radiusChange/2.0)*rotationRadius);
		this.dae.position.z = this.position.z -= Math.sin(phi) * 2 * (Math.sin(radiusChange/2.0)*rotationRadius);
	}
	this.fwRotationMatrix.y = this.cameraAngleY - this.rotation.y;
    this.fwRotationMatrix.x -= (dt * this.carSpeed) / (2.0*Math.PI*this.wheelRadius);
	this.objects["flWheel"].rotation.set(0,0,0);
	this.objects["frWheel"].rotation.set(0,0,0);
	this.objects["rlWheel"].rotation.set(0,0,0);
	this.objects["rrWheel"].rotation.set(0,0,0);
	this.objects["flWheel"].rotateOnAxis(new THREE.Vector3(0,1,0), this.fwRotationMatrix.y);
    this.objects["frWheel"].rotateOnAxis(new THREE.Vector3(0,1,0), this.fwRotationMatrix.y);
	for (var x in this.objects["wheels"]) {
		this.objects["wheels"][x].rotateOnAxis(new THREE.Vector3(-1,0,0), this.fwRotationMatrix.x);
	}
	
	/////////// Speed depentant rotations
	var centForce;
	if (rotationRadius == 0)
		centForce = 0;
	else
	{
		centForce = this.carMass * this.carSpeed * this.carSpeed / rotationRadius;
		if (this.carTurn < 0)
			centForce = -centForce;
	}
	if (this.carTurn > 0)
		centForce = -centForce; // centrufugal force
		
	var wantedXTilt = -acceleration/400;
	var deltaXTilt = this.objects["default"].rotation.x - wantedXTilt;
	var xTilt = this.objects["default"].rotation.x - deltaXTilt * 8 * dt; // camera tilt amortization
	for (var x in this.objects["exceptWheels"]) {
		this.objects["exceptWheels"][x].rotation.x = xTilt;
		this.objects["exceptWheels"][x].rotation.z = centForce/1300000;
	}
	
	
	this.cameraSpeedMove = this.carSpeed / 100;
	this.cameraPositionY = xTilt;
	/////////// END Speed dependant rotations
	this.carAcc = acceleration;
};

CAR.car.prototype.calcRpm = function(carSpeed, gearRatio, finalDrive, wheelRadius)
{
	return (((carSpeed*3600/1000)/1.6)*gearRatio*finalDrive*336)/((wheelRadius * 2 * 1000) / 25.4);
}