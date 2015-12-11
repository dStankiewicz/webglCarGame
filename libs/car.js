/*global THREE*/
var CAR = CAR || {};

var degToRad = function(deg)
{
    return deg * Math.PI / 180.0;
};

CAR.car = function(params)
{
    CAR.CarBasic.call(this);
    
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
	this.wheelBaseWidth = 0;
    this.wheelRadius = 0.3425;
};

CAR.car.prototype = Object.create(CAR.CarBasic.prototype);


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
	this.cameraAngleY = this.rotation.y + Math.PI;
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
	this.dae.rotation.y = this.rotation.y -= radiusChange;
	var phi = Math.PI - radiusChange/2.0 - Math.PI/2.0 + this.rotation.y;
	if (this.rotation.y == Math.PI)
	{
		this.dae.position.x = this.position.x -= Math.sin(this.rotation.y) * this.carSpeed * dt;
		this.dae.position.z = this.position.z += Math.cos(this.rotation.y) * this.carSpeed * dt;
	}
	else
	{
		this.dae.position.x = this.position.x -= Math.cos(phi) * 2 * (Math.sin(radiusChange/2.0)*rotationRadius);
		this.dae.position.z = this.position.z += Math.sin(phi) * 2 * (Math.sin(radiusChange/2.0)*rotationRadius);
	}
	this.fwRotationMatrix.y = this.cameraAngleY - this.rotation.y;
    this.fwRotationMatrix.x -= (dt * this.carSpeed) / (2.0*Math.PI*this.wheelRadius);
	// this.objects["kolo_pl"].rotation.set(0,0,0);
	// this.objects["kolo_pp"].rotation.set(0,0,0);
	// this.objects["kolo_tl"].rotation.set(0,0,0);
	// this.objects["kolo_tp"].rotation.set(0,0,0);
	// this.objects["kolo_pp"].rotateOnAxis(new THREE.Vector3(0,1,0), this.fwRotationMatrix.y);
 //   this.objects["kolo_pl"].rotateOnAxis(new THREE.Vector3(0,1,0), this.fwRotationMatrix.y);
	// for (var x in this.objects["wheels"]) {
	// 	this.objects["wheels"][x].rotateOnAxis(new THREE.Vector3(-1,0,0), this.fwRotationMatrix.x);
	// }
	this.kolo_pl.rotation.y = this.kolo_pp.rotation.y = this.fwRotationMatrix.y;

    this.felga_pl.rotation.x = this.fwRotationMatrix.x;
    this.felga_pp.rotation.x = this.fwRotationMatrix.x;
    this.felga_tp.rotation.x = this.fwRotationMatrix.x;
    this.felga_tl.rotation.x = this.fwRotationMatrix.x;
    this.opona_pl.rotation.x = this.fwRotationMatrix.x;
    this.opona_pp.rotation.x = this.fwRotationMatrix.x;
    this.opona_tl.rotation.x = this.fwRotationMatrix.x;
    this.opona_tp.rotation.x = this.fwRotationMatrix.x;
	
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
	var deltaXTilt = this.karoseria.rotation.x - wantedXTilt;
	var xTilt = this.karoseria.rotation.x - deltaXTilt * 8 * dt; // camera tilt amortization
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