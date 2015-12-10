/*global CAR THREE hemiLight*/

$(function(){
	
	var scene, camera, renderer;
	var controls;
	var CONTAINER = $("#webGL-container");
    var filePath;
    var car = new CAR.CarBasic();
    
    
    function start(){
        init();
        animate();
        console.log(scene);
    }
    
    //event dla buttona z id="load"
    //pobiera ścieżkę do pliku z atrybutu data 
    $("#load").click(function(){
        filePath = $(this).attr('data');
        start();
    })
    
    //event dla buttona z id="save"
    $('#save').click(function(){
        car.save();
    });
    
	function init(){
		/*creates empty scene object and renderer*/
		scene = new THREE.Scene();
		camera =  new THREE.PerspectiveCamera(45, CONTAINER.width()/CONTAINER.height(), .1, 500);
		renderer = new THREE.WebGLRenderer({antialias:true});
		
		renderer.setClearColor(0x555555);
		renderer.setSize(CONTAINER.width(), CONTAINER.height());
		renderer.shadowMapEnabled= true;
		renderer.shadowMapSoft = true;
		
		/*add controls*/
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.addEventListener( 'change', render );
					
		camera.position.x = 5;
		camera.position.y = 9;
		camera.position.z = 42;	
		camera.lookAt(scene.position);        
        
        /*load model*/
        car.load( filePath, scene, true );
        
        // LIGHTS

        hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
        hemiLight.color.setRGB(0.5, 0.5, 0.7);
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );
        scene.add( hemiLight );
        
        // helpers
        var axisHelper = new THREE.AxisHelper( 20 );
        scene.add( axisHelper );
		
		CONTAINER.append(renderer.domElement);
	}

	function render() {

        car.kolo_pl.rotation.y =  car.kolo_pp.rotation.y = car.guiControls.skret/10;
        
        car.felga_pl.rotation.x +=  car.guiControls.przyspieszenie/40;
        car.felga_pp.rotation.x +=  car.guiControls.przyspieszenie/40;
        car.felga_tp.rotation.x += car.guiControls.przyspieszenie/40;
        car.felga_tl.rotation.x += car.guiControls.przyspieszenie/40;
        car.opona_pl.rotation.x += car.guiControls.przyspieszenie/40;
        car.opona_pp.rotation.x +=  car.guiControls.przyspieszenie/40;
        car.opona_tl.rotation.x += car.guiControls.przyspieszenie/40;
        car.opona_tp.rotation.x +=  car.guiControls.przyspieszenie/40;
        
        //car.dae.rotation.y += 1/100;
        
        car.nadwozie.rotation.x = - car.guiControls.przyspieszenie/400;
        
        car.nadwozie.rotation.z = - car.guiControls.przyspieszenie/400 * car.guiControls.skret/10;

	}

	
	function animate(){
		requestAnimationFrame(animate);
		render();
		renderer.render(scene, camera);
	}  
});	




    