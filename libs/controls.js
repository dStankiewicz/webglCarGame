var CAR = CAR || {};

CAR.Controls = function() {
	this.pressed = {};
	this.modifiers = {};
	
	var self = this;
	this._onKeyDown = function(event){self._onKeyChange(event, true)};
	this._onKeyUp   = function(event){self._onKeyChange(event, false)};

	document.addEventListener("keydown", this._onKeyDown, false);
	document.addEventListener("keyup", this._onKeyUp, false);
	
	//object.cameraAngleY = 0;

	//this.update = function(dt) {
};

CAR.Controls.MODIFIERS = ["shift", "ctrl", "alt", "meta"];
CAR.Controls.ALIAS	= {
	"left"		: 37,
	"up"		: 38,
	"right"		: 39,
	"down"		: 40,
	"space"		: 32
};

CAR.Controls.prototype.destroy = function()
{
	document.removeEventListener("keydown", this._onKeyDown, false);
	document.removeEventListener("keyup", this._onKeyUp, false);
};

CAR.Controls.prototype._onKeyChange = function(event, isPressed)
{
	var keyCode = event.keyCode;
	this.pressed[keyCode]	= isPressed;

	// update this.modifiers
	this.modifiers["shift"] = event.shiftKey;
	this.modifiers["ctrl"]	= event.ctrlKey;
	this.modifiers["alt"]	= event.altKey;
	this.modifiers["meta"]	= event.metaKey;
};

CAR.Controls.prototype.pressed	= function(keyDesc)
{
	var keys = keyDesc.split("+");
	for(var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		var isPressed;
		if(CAR.Controls.MODIFIERS.indexOf(key) !== -1)
		{
			isPressed = this.modifiers[key];
		}
		else if(Object.keys(CAR.Controls.ALIAS).indexOf(key) != -1)
		{
			isPressed = this.pressed[CAR.Controls.ALIAS[key]];
		}
		else 
		{
			isPressed = this.pressed[key.toUpperCase().charCodeAt(0)];
		}
		if(!isPressed)
			return false;
	}
	return true;
};
