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
    this.carAcc = 0;
    this.carMass = 1750;
    this.carSpeed = 0;
    this.cx = 0.35;
    this.engineTorque = 560;
    this.finalDrive = 3.71;
    this.gear = 1;
    this.gearRatios = [3.15, 1.95, 1.44, 1.15, 0.94, 0.76];
    this.loaded = false;
    this.rpm = 0;
    this.wheelRadius = 0.3425;
	this.throttle = 0;
	this.castShadow = true;
    
    this.load = function(scene, startFunc)
	{
		var obj = this;
		var objLoader = new THREE.OBJMTLLoader();
		var objMaterial = new THREE.MeshLambertMaterial( {color: 0x0BBD43} );
		objLoader.load("res/models/rapide.obj", "res/models/rapide.mtl", function(loadedObj)
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
			scene.add(obj);
			startFunc();
		});
	};
};

CAR.car.prototype = Object.create(THREE.Object3D.prototype);


CAR.car.prototype.move = function(keys, camera, dt)
{
	var cameraAmortization = 0.915;
	var prop = 0;
	var acceleration = 0;
	var fTraction = 0, fRr = 0, force = 0;
	var fDrag = 0;
	var rr = 30 * this.cx; //Rolling resistance
	
	/////////// START Keyboard streering
	if (keys.pressed[37]) // Left arrow
	{
		if(this.carSpeed > 0.001){
			prop = dt * 10 / (this.carSpeed+10);
			if (prop > 1)
				prop = Math.sqrt(prop);
			this.rotation.y += 2.5 * prop;
			this.cameraAngleY += this.cameraDelay;
			this.cameraAngleY += 2.5 * prop;
			if (this.cameraDelay > degToRad(-10))
				this.cameraDelay -= 0.015;
			if (this.cameraDelay > 0)
				this.cameraDelay -= 1 * prop + this.cameraDelay / 10;
			this.cameraAngleY -= this.cameraDelay;
		}
	} 
	if (keys.pressed[39]) // Right arrow
	{
		if(this.carSpeed > 0.001){
			prop = dt * 10 / (this.carSpeed+10);
			if (prop > 1)
				prop = Math.sqrt(prop);
			this.rotation.y -= 2.5 * prop;
		    this.cameraAngleY += this.cameraDelay;
			this.cameraAngleY -= 2.5 * prop;
			if (this.cameraDelay < degToRad(10))
				this.cameraDelay += 0.015;
			if (this.cameraDelay < 0)
				this.cameraDelay += 1 * prop - this.cameraDelay / 10;
			this.cameraAngleY -= this.cameraDelay;
		}
	}
	if(!keys.pressed[39] && !keys.pressed[37])
	{
		this.cameraAngleY += this.cameraDelay;
		this.cameraDelay *= cameraAmortization;
		this.cameraAngleY -= this.cameraDelay;
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
				this.brake += dt;
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
			this.brake -= dt;
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
		
	this.position.x -= Math.sin(this.rotation.y) * this.carSpeed * dt;
	this.position.z -= Math.cos(this.rotation.y) * this.carSpeed * dt;
	this.carAcc = acceleration;
};

CAR.car.prototype.calcRpm = function(carSpeed, gearRatio, finalDrive, wheelRadius)
{
	return (((carSpeed*3600/1000)/1.6)*gearRatio*finalDrive*336)/((wheelRadius * 2 * 1000) / 25.4);
}