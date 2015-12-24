/*global THREE*/

var CAR = CAR || {};



CAR.CarBasic = function() {
    
    THREE.Object3D.call(this);
    
    this.cubeCamera = new THREE.CubeCamera( 1, 1000, 256 );
    this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.textureCube = this.cubeCamera.renderTarget;
    this.mlib = new CAR.Materials(this.textureCube);
    
  //grupy:
    this.kolo_pl;
    this.kolo_pp;
    this.nadwozie;
    this.kolo_tp;
    this.kolo_tl;
    
  //calosc
    this.dae;
    
  //elementy:
    this.felga_pp; this.opona_pp; this.hamulec_pp;
    this.felga_pl; this.hamulec_pl; this.opona_pl;  
    this.felga_tp; this.opona_tp; this.hamulec_tp;
    this.felga_tl; this.opona_tl; this.hamulec_tl;
    this.karoseria; this.lusterka; this.spoiler; this.szyby; this.wycieraczka; this.wydech; this.zderzak_p; this.zderzak_t; this.lampy_p; this.lampy_t;
    
    this.LOADED_DATA; //ustawienia zaladowane z pliku .json
    this.jsonFileName; //sciezka do pliku .json
    
  //kontrolki
    this.datGUI;
    
    this.folder;
    
    this.params = new function(){           

        this.colladaFilePath = "";
        this.scale = 1.1;
        
        //car
        this.felgi = "Orange"; 
        this.hamulce = "Orange"; 
        this.karoseria = "Orange"; 
        this.lusterka = "Orange"; 
        this.opony = "Orange"; 
        this.dodaj_spoiler = true;
        this.spoiler = "Orange"; 
        this.szyby = "Orange"; 
        this.wycieraczka = "Orange"; 
        this.wydech = "Orange"; 
        this.zderzakp = "Orange"; 
        this.zderzakt = "Orange"; 
        this.lampy_t = "Orange";
        this.lampy_p = "Orange";

        //technical data
        this.brakingForce = -25000;
        this.carMass = 1750;
        this.cx = 0.35;
        this.engineTorque = 560;
        this.finalDrive = 3.71;
        this.wheelRadius = 0.3425;
        this.wheelBaseLength = 0.1;
        this.gearRatios = [3.15, 1.95, 1.44, 1.15, 0.94, 0.76];
        this.gearRatios_0 = 3.15;
        this.gearRatios_1 = 1.95;
        this.gearRatios_2 = 1.44;
        this.gearRatios_3 = 1.15;
        this.gearRatios_4 = 0.94;
        this.gearRatios_5 = 0.76;
        
        this.skret = 0;
        this.przyspieszenie = 0;
    } 
}

CAR.CarBasic.prototype = Object.create( THREE.Object3D.prototype );

// Ustawiamy właściwość "constructor" na obiekt Student
//CAR.CarBasic.prototype.constructor = CAR.CarBasic;

CAR.CarBasic.prototype.loadGui = function (controls){
    var obj = this;
    obj.datGUI = new dat.GUI({ autoPlace: controls, load: obj.LOADED_DATA});
    obj.datGUI.remember(obj.params);
       
    
    if(!controls){
        var customContainer = document.getElementById('my-gui-container');
        if(customContainer != null) {
            customContainer.appendChild(obj.datGUI.domElement); 
        }
    }
          	
    var f0 = obj.datGUI.addFolder('Info');
        f0.add(obj.params, 'colladaFilePath');
        f0.add(obj.params, 'scale', 0, 10).onChange(function(value){
            obj.dae.scale.x = obj.dae.scale.y = obj.dae.scale.z = value;
        });
        f0.open();
    
    var f1 = obj.datGUI.addFolder('Materials');
    obj.folder = f1;
        
        f1.add(obj.params, 'skret', -5, 5);
        f1.add(obj.params, 'przyspieszenie', -5, 700);;	
    
        f1.add(obj.params, 'zderzakp', obj.mlib.names ).onChange(function(value){
            obj.zderzak_p.children[0].material = obj.mlib.materials[value];
        });	
    
        f1.add(obj.params, 'zderzakt', obj.mlib.names ).onChange(function(value){
            obj.zderzak_t.children[0].material = obj.mlib.materials[value];
        });	
//    
        f1.add(obj.params, 'karoseria', obj.mlib.names ).onChange(function(value){
            obj.karoseria.children[0].material = obj.mlib.materials[value];
        }).listen();	
    
        f1.add(obj.params, 'lusterka', obj.mlib.names ).onChange(function(value){
            obj.lusterka.children[0].material = obj.mlib.materials[value];
        });	
        
        f1.add(obj.params, 'lampy_t', obj.mlib.names ).onChange(function(value){
            obj.lampy_t.children[0].material = obj.mlib.materials[value];
        });	
    
        f1.add(obj.params, 'lampy_p', obj.mlib.names ).onChange(function(value){
            obj.lampy_p.children[0].material = obj.mlib.materials[value];
        });	
        
        f1.add(obj.params, 'szyby', obj.mlib.names ).onChange(function(value){
            obj.szyby.children[0].material = obj.mlib.materials[value];
        });	
    
        f1.add(obj.params, 'spoiler', obj.mlib.names ).onChange(function(value){
            obj.spoiler.children[0].material = obj.mlib.materials[value];
        });	
        
        f1.add(obj.params, 'wycieraczka', obj.mlib.names ).onChange(function(value){
            obj.wycieraczka.children[0].material = obj.mlib.materials[value];
        });	
    
        f1.add(obj.params, 'wydech', obj.mlib.names ).onChange(function(value){
            obj.wydech.children[0].material = obj.mlib.materials[value];
        });	
    
        f1.add(obj.params, 'felgi', obj.mlib.names ).onChange(function(value){
            obj.felga_pl.children[0].material = obj.mlib.materials[value];
            obj.felga_pp.children[0].material = obj.mlib.materials[value];
            obj.felga_tl.children[0].material = obj.mlib.materials[value];
            obj.felga_tp.children[0].material = obj.mlib.materials[value];
        });	
    
        f1.add(obj.params, 'hamulce', obj.mlib.names ).onChange(function(value){
            obj.hamulec_pl.children[0].material = obj.mlib.materials[value];
            obj.hamulec_pp.children[0].material = obj.mlib.materials[value];
            obj.hamulec_tl.children[0].material = obj.mlib.materials[value];
            obj.hamulec_tp.children[0].material = obj.mlib.materials[value];
        });	
    
    
        f1.open();
    
    var f2 = obj.datGUI.addFolder('Technical data');
        f2.add(obj.params, 'brakingForce', -50000, 0);
        f2.add(obj.params, 'carMass', 0, 5000);
        f2.add(obj.params, 'cx', 0, 1);
        f2.add(obj.params, 'engineTorque', 0, 1000);
        f2.add(obj.params, 'wheelRadius', 0, 1);
        f2.add(obj.params, 'wheelBaseLength', 0, 10).listen();
        f2.add(obj.params, 'finalDrive', 0, 10);
        var f2_1 = f2.addFolder('gearRatios');
            f2_1.add(obj.params, 'gearRatios_0', 0, 10).onChange(function(value){
                obj.params.gearRatios[0] = value;
            });
            f2_1.add(obj.params, 'gearRatios_1', 0, 10).onChange(function(value){
                obj.params.gearRatios[1] = value;
            });
            f2_1.add(obj.params, 'gearRatios_2', 0, 10).onChange(function(value){
                obj.params.gearRatios[2] = value;
            });
            f2_1.add(obj.params, 'gearRatios_3', 0, 10).onChange(function(value){
                obj.params.gearRatios[3] = value;
            });
            f2_1.add(obj.params, 'gearRatios_4', 0, 10).onChange(function(value){
                obj.params.gearRatios[4] = value;
            });
            f2_1.add(obj.params, 'gearRatios_5', 0, 10).onChange(function(value){
                obj.params.gearRatios[5] = value;
            });
    f2.open();
    f2.d
}


CAR.CarBasic.prototype.loadCollada = function(scene, params){
    var obj = this;
    var loader = new THREE.ColladaLoader();
    
    loader.options.convertUpAxis = true;
    loader.load(obj.params.colladaFilePath,          function (collada){
        obj.dae = collada.scene;
        obj.dae.traverse(function (child){
            child.traverse(function(e){
                e.castShadow = true;
                //e.receiveShadow = true;
                if (e.material instanceof THREE.MeshPhongMaterial){
                    e.material.needsUpdate = true;
                }	
            });

            switch(child.colladaId){
                    
                case "kolo_pp":
                    obj.kolo_pp = child;
                    child.traverse(function(child2){
                         switch(child2.colladaId){
                            case "felga_pp": 
                                obj.felga_pp = child2;
                                break;
                            case "opona_pp": 
                                obj.opona_pp = child2;
                                break;
                            case "hamulec_pp": 
                                obj.hamulec_pp = child2;
                                break;
                         }
                    })
                    break;
                case "kolo_pl":
                    obj.kolo_pl = child;
                    child.traverse(function(child2){
                         switch(child2.colladaId){
                            case "felga_pl": 
                                obj.felga_pl = child2;
                                break;
                            case "opona_pl": 
                                obj.opona_pl = child2;
                                break;
                            case "hamulec_pl": 
                                obj.hamulec_pl = child2;
                                break;
                         }
                    })
                    break;
                case "kolo_tp":
                    obj.kolo_tp = child;
                    child.traverse(function(child2){
                         switch(child2.colladaId){
                            case "felga_tp": 
                                obj.felga_tp = child2;
                                break;
                            case "opona_tp": 
                                obj.opona_tp = child2;
                                break;
                            case "hamulec_tp": 
                                obj.hamulec_tp = child2;
                                break;
                         }
                    })
                    break;
                case "kolo_tl":
                    obj.kolo_tl = child;
                    child.traverse(function(child2){
                         switch(child2.colladaId){
                            case "felga_tl": 
                                obj.felga_tl = child2;
                                break;
                            case "opona_tl": 
                                obj.opona_tl = child2;
                                break;
                            case "hamulec_tl": 
                                obj.hamulec_tl = child2;
                                break;
                         }
                    })
                    break;
                case "nadwozie":
                    
                    obj.nadwozie = child;
                    child.traverse(function(child2){
                         switch(child2.colladaId){
                            case "karoseria": 
                                obj.karoseria = child2;
                                break;
                            case "lusterka": 
                                obj.lusterka = child2;
                                break;
                            case "spoiler": 
                                obj.spoiler = child2;
                                break;
                            case "szyby": 
                                obj.szyby = child2;
                                break;
                            case "wycieraczka": 
                                obj.wycieraczka = child2;
                                break;
                            case "wydech": 
                                obj.wydech = child2;
                                break;
                            case "zderzak_p": 
                                obj.zderzak_p = child2;
                                break;
                            case "zderzak_t": 
                                obj.zderzak_t = child2;
                                break;
                            case "lampy_p": 
                                obj.lampy_p = child2;
                                break;
                            case "lampy_t": 
                                obj.lampy_t = child2;
                                break;
                         }
                    })
                    break;
            }
        });
	    obj.params.wheelBaseLength = obj.kolo_pl.position.distanceTo(obj.kolo_pp.position);
        obj.dae.updateMatrix();
        obj.datGUI.revert();
        obj.params.scale = params["scale"] || 1;
        scene.add(obj.dae);   
        scene.add( obj.cubeCamera );        
    });	
};
    

CAR.CarBasic.prototype.load = function (file, scene, controls, startFunction, params){
    startFunction = startFunction || null;
    params = params || {};
    var obj = this;
    obj.jsonFileName = file;
    //var results = document.getElementById("results");
    var hr = new XMLHttpRequest();
    hr.open("POST", "json_load_data.php", true);
    hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    hr.onreadystatechange = function() {
        if(hr.readyState == 4 && hr.status == 200) {
            obj.LOADED_DATA = JSON.parse(hr.responseText);
            obj.loadGui(controls);
            obj.loadCollada(scene, params);
            if(startFunction !== null)
            startFunction()
        }
    }
    hr.send("file="+file);
    //results.innerHTML = "requesting...";
}

CAR.CarBasic.prototype.save = function (){
    var obj = this;
    var jsonObject = this.datGUI.getSaveObject();
    $.post("json_save_data.php", {
        json : JSON.stringify(jsonObject), 
        file : obj.jsonFileName
    }); 
}
    
CAR.CarBasic.prototype.saveAs = function (fileName){
    var obj = this;
    var jsonObject = this.datGUI.getSaveObject();
    $.post("json_save_data.php", {
        json : JSON.stringify(jsonObject), 
        file : fileName
    }); 
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}