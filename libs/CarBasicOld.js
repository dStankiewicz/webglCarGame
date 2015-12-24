/*global THREE*/

var CAR = CAR || {};

CAR.CarBasic = function() {
    
    THREE.Object3D.call(this);
    
    this.kolo_pl;
    this.kolo_pp;
    this.nadwozie;
    this.kolo_tp;
    this.kolo_tl;
    this.dae;
    this.felga_pp; this.opona_pp; this.hamulec_pp;
    this.felga_pl; this.hamulec_pl; this.opona_pl;  
    this.felga_tp; this.opona_tp; this.hamulec_tp;
    this.felga_tl; this.opona_tl; this.hamulec_tl;
    this.karoseria; this.lusterka; this.spoiler; this.szyby; this.wycieraczka; this.wydech; this.zderzak_p; this.zderzak_t; this.lampy_p; this.lampy_t;
    this.LOADED_DATA;
    this.jsonFileName;
    this.datGUI;
    
    this.guiControls = new function(){           

        this.colladaFilePath = "";
        
        //car
        this.felgi = "#ffffff"; 
        this.hamulce = "#ffffff"; 
        this.karoseria = "#ffffff"; 
        this.lusterka = "#ffffff"; 
        this.opony = "#ffffff"; 
        this.dodaj_spoiler = true;
        this.spoiler = "#ffffff"; 
        this.szyby = "#ffffff"; 
        this.wycieraczka = "#ffffff"; 
        this.wydech = "#ffffff"; 
        this.zderzakp = "#ffffff"; 
        this.zderzakt = "#ffffff"; 

        this.skret = 0;
        this.przyspieszenie = 0;
    }
        
    
    
}

CAR.CarBasic.prototype = Object.create( THREE.Object3D.prototype );

// Ustawiamy właściwość "constructor" na obiekt Student
//CAR.CarBasic.prototype.constructor = CAR.CarBasic;

// Zmieniamy metodę "sayHello"


CAR.CarBasic.prototype.loadCollada = function(scene, params){
    var obj = this;
    var loader = new THREE.ColladaLoader();
    params = params || {};

    loader.options.convertUpAxis = true;
    loader.load(obj.guiControls.colladaFilePath,          function (collada){
        obj.dae = collada.scene;
        obj.dae.traverse(function (child){
            child.traverse(function(e){
                e.castShadow = true;
                e.receiveShadow = true;
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
                    // child.material.side = THREE.DoubleSide;
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
	    obj.wheelBaseLength = obj.kolo_pl.position.distanceTo(obj.kolo_pp.position);
        obj.dae.updateMatrix();
        obj.dae.scale.x = obj.dae.scale.y = obj.dae.scale.z = params["scale"] || 1;
        scene.add(obj.dae);    
        obj.datGUI.revert();
        
    });	
};
    
CAR.CarBasic.prototype.loadGui = function (controls){
    var obj = this;
    obj.datGUI = new dat.GUI({ autoPlace: controls, load: obj.LOADED_DATA});
    obj.datGUI.remember(obj.guiControls);
       
    
    if(!controls){
        var customContainer = document.getElementById('my-gui-container');
        if(customContainer != null) {
            customContainer.appendChild(obj.datGUI.domElement); 
        }
    }
          	

    var f1 = this.datGUI.addFolder('Car');
    
        f1.add(obj.guiControls, 'colladaFilePath');
        f1.add(obj.guiControls, 'skret', -5, 5);
        f1.add(obj.guiControls, 'przyspieszenie', -5, 7);

        f1.addColor(this.guiControls, 'felgi').onChange(function(value){
            var e = obj.felga_tp.children[0];
                    
                e.material.color.r = hexToRgb(value).r/255;
                e.material.color.g = hexToRgb(value).g/255;
                e.material.color.b = hexToRgb(value).b/255;
             
            
        });		
//
//            f1.addColor(guiControls, 'hamulce').onChange(function(value){
//                hamulcet.material.color.r = hexToRgb(value).r/255;
//                hamulcet.material.color.g = hexToRgb(value).g/255;
//                hamulcet.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.addColor(guiControls, 'karoseria').onChange(function(value){
//                karoseria.material.color.r = hexToRgb(value).r/255;
//                karoseria.material.color.g = hexToRgb(value).g/255;
//                karoseria.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.addColor(guiControls, 'lusterka').onChange(function(value){
//                lusterka.material.color.r = hexToRgb(value).r/255;
//                lusterka.material.color.g = hexToRgb(value).g/255;
//                lusterka.material.color.b = hexToRgb(value).b/255;
//            });
//
//            f1.addColor(guiControls, 'opony').onChange(function(value){
//                oponyt.material.color.r = hexToRgb(value).r/255;
//                oponyt.material.color.g = hexToRgb(value).g/255;
//                oponyt.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.add(guiControls, 'dodaj_spoiler').onChange(function(value){
//                spoiler.visible = value;
//            });	
//
//            $("#spoiler").click(function(){
//                spoiler.visible = !spoiler.visible;
//            });
//
//
//
//
//            f1.addColor(guiControls, 'spoiler').onChange(function(value){
//                spoiler.material.color.r = hexToRgb(value).r/255;
//                spoiler.material.color.g = hexToRgb(value).g/255;
//                spoiler.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.addColor(guiControls, 'szyby').onChange(function(value){
//                szyby.material.color.r = hexToRgb(value).r/255;
//                szyby.material.color.g = hexToRgb(value).g/255;
//                szyby.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.addColor(guiControls, 'wycieraczka').onChange(function(value){
//                wycieraczka.material.color.r = hexToRgb(value).r/255;
//                wycieraczka.material.color.g = hexToRgb(value).g/255;
//                wycieraczka.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.addColor(guiControls, 'wydech').onChange(function(value){
//                wydech.material.color.r = hexToRgb(value).r/255;
//                wydech.material.color.g = hexToRgb(value).g/255;
//                wydech.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.addColor(guiControls, 'zderzakp').onChange(function(value){
//                zderzakp.material.color.r = hexToRgb(value).r/255;
//                zderzakp.material.color.g = hexToRgb(value).g/255;
//                zderzakp.material.color.b = hexToRgb(value).b/255;
//            });	
//
//            f1.addColor(guiControls, 'zderzakt').onChange(function(value){
//                zderzakt.material.color.r = hexToRgb(value).r/255;
//                zderzakt.material.color.g = hexToRgb(value).g/255;
//                zderzakt.material.color.b = hexToRgb(value).b/255;
//            });

        f1.open();
    
}

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