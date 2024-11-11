/**
 * FMI VR/AR/XR Library
 *
 * 2024-11-10 v1.14-physi SUpport fir physijs
 * 2024-10-27 v1.14 Renamed vaxSceneInit to initScene
 * 2024-10-14 v1.13 Set default light intensity
 * 2024-05-21 v1.12 Added check for xr in the render loop, added vaxInitVR
 * 2024-04-20 v1.11 Added "rendererOptions" to vaxInit (Lecture №10)
 * 2024-04-11 v1.10 Exported  "effect", add parameters to "vaxSceneInit" (Exercise №8)
 * 2024-04-07 v1.09 Added "vaxInitAnaglyph" and "vaxInitParallax" (Lecture №8)
 * 2024-04-01 v1.08 Added "perspective", "orthogonal", "dTime" in "animate" (Lecture №7)
 * 2024-03-21 v1.06 Added "robotMaterial", "robotElement" and "robotElementShape" (Lecture №5)
 * 2024-03-17 v1.05 "showStats" defaults to "false", added "outputColorSpace" (Lecture №5)
 * 2024-03-12 v1.04 Added "vaxSceneInit" and "pillar" (Lecture №4)
 * 2024-03-01 v1.03 Export "renderer" and "camera" (Lecture №3)
 * 2024-02-28 v1.02 Export "light" (Lecture №3)
 * 2024-02-26 v1.01 Created (Lecture №2)
 *
 */


import * as THREE from "three";
import "physijs";
import Stats from "three/addons/libs/stats.module.js";
//import {AnaglyphEffect} from "three/addons/effects/AnaglyphEffect.js";
import {AnaglyphEffect} from "https://boytchev.github.io/CourseVAX/lib/AnaglyphEffect.js";
import {StereoEffect} from "three/addons/effects/StereoEffect.js";
import {VRButton} from 'three/addons/webxr/VRButton.js';


console.log( 'vax.js v1.14/Phy ˁ˚ᴥ˚ˀ' )


var renderer, scene, camera, light, stats, t, animate, ground, ambientLight, spotLight, object, effect;


var showStats = !true;
var perspective = true;


function init( animateLoop, rendererOptions = {antialias:true, stats:false} )
{
	rendererOptions.antialias = rendererOptions.antialias ?? true;
	
	animate = animateLoop;
	
	renderer = new THREE.WebGLRenderer(rendererOptions);
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	
	document.body.appendChild(renderer.domElement);
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';

	if (rendererOptions.stats)
	{
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

	Physijs.scripts.worker = 'physijs/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';
	scene = new Physijs.Scene();
	
	if( rendererOptions.alpha )
	{
		renderer.setClearColor( 0, 0 );
	}
	else
	{
		scene.background = new THREE.Color('white');
	}

	if(	perspective )
		camera = new THREE.PerspectiveCamera( 60, 1, 1, 1000 );
	else
		camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 1, 1000 );

	camera.position.set(0, 0, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	light = new THREE.PointLight('white', Math.PI);
	light.decay = 0;
	light.position.set(0, 150, 300);
	scene.add(light);

	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();

	renderer.setAnimationLoop(frame);
}


function initVR( animateLoop, rendererOptions = {antialias:true} )
{
	init( animateLoop, rendererOptions );

	camera = new THREE.PerspectiveCamera( 60, 1, 0.01, 1000 );
	
	var vrButton = VRButton.createButton( renderer ); // глобална променлива
	document.body.appendChild( vrButton );
	
	renderer.xr.enabled = true;
	
	camera.position.set( 0, 0, 0 );
}


function initAnaglyph( animateLoop )
{
	animate = animateLoop;
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	
	document.body.appendChild(renderer.domElement);
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';

	// if (showStats)
	// {
		// stats = new Stats();
		// document.body.appendChild(stats.dom);
	// }

	scene = new THREE.Scene();
	
	scene.background = new THREE.Color('white');

	camera = new THREE.PerspectiveCamera( 60, 1, 1, 1000 );
	camera.focus = 10;
	
	camera.position.set(0, 0, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	light = new THREE.PointLight('white', 2);
	light.decay = 0;
	light.position.set(0, 150, 300);
	scene.add(light);

	effect = new AnaglyphEffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );
								
	window.addEventListener('resize', onWindowResizeAnaglyph, false);
	onWindowResizeAnaglyph();

	renderer.setAnimationLoop( frameAnaglyph );
}


function initParallax( animateLoop, eyeSep = 1 )
{
	animate = animateLoop;
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	
	document.body.appendChild(renderer.domElement);
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';

	// if (showStats)
	// {
		// stats = new Stats();
		// document.body.appendChild(stats.dom);
	// }

	scene = new THREE.Scene();
	
	scene.background = new THREE.Color('white');

	camera = new THREE.PerspectiveCamera( 60, 1, 1, 1000 );
	camera.focus = 10;
	
	camera.position.set(0, 0, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	light = new THREE.PointLight('white', 2);
	light.decay = 0;
	light.position.set(0, 150, 300);
	scene.add(light);

	effect = new StereoEffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );
	effect.setEyeSeparation( eyeSep );
								
	window.addEventListener('resize', onWindowResizeAnaglyph, false); // преизползваме анаглифния случай
	onWindowResizeAnaglyph();

	renderer.setAnimationLoop( frameAnaglyph ); // преизползваме анаглифния случай
}


function onWindowResize(event)
{
	if(	perspective ) camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight, true);
}


function onWindowResizeAnaglyph( event )
{
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();

	effect.setSize( window.innerWidth, window.innerHeight, true );
}			



var oldTime = 0;
var accTime = 0;
var setTime = 0;
function frame(time)
{
	if( !renderer.xr.enabled )
	{
		// защита от прекалено голяма скорост, при по-бързи компютри някои анимации
		// ще са прекалено бързи, затова изкуствено се забавя до 60 fps
		accTime += time - oldTime;
		oldTime = time;
		if (accTime < 1000 / 60)
			return;
		accTime = 0;
	}
	
	if( animate )
		animate( time/1000, (time-setTime)/1000 );
	
	setTime = time;

	if (stats) stats.update();

	renderer.render(scene, camera);
}


function frameAnaglyph( time )
{
	// защита от прекалено голяма скорост, при по-бързи компютри някои анимации
	// ще са прекалено бързи, затова изкуствено се забавя до 60 fps
	accTime += time-oldTime;
	oldTime = time;
	if( accTime < 1000/60 ) return;
	accTime = 0;

	if( animate ) animate( time/1000, (time-setTime)/1000 );
	
	setTime = time;
	
	if (stats) stats.update();
	
	effect.render( scene, camera );
}


// Общи настройки на сцената
function initScene(animateLoop, vax = init, vaxInitParam = 0 )
{
	vax(animateLoop);

	// включваме сенки
	renderer.shadowMap.enabled = true;

	// фиксирана гледна точка
	camera.position.set(0, 100, 150);
	camera.lookAt(new THREE.Vector3(0, 20, 0));

	// наличната светлина я правим по-слаба
	light.intensity = 1;

	// околна светлина за по-бледи сенки
	ambientLight = new THREE.AmbientLight('gold', 1.5);
	scene.add(ambientLight);

	// прожекторна светлина за сенки
	spotLight = new THREE.SpotLight('white', 2.5, 0, 1.0, 1.0);
	spotLight.decay = 0;
	spotLight.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
	spotLight.position.set(0, 100, 0);
	spotLight.target = new THREE.Object3D();
	spotLight.castShadow = true;
	scene.add(spotLight);
	scene.add(spotLight.target);

	// земя
	ground = new THREE.Mesh(
			new THREE.BoxGeometry(300, 4, 300),
			new THREE.MeshPhysicalMaterial({color: 'lightgreen'})
		);
	ground.position.set(0, -2, 0);
	ground.receiveShadow = true;
	scene.add(ground);

	// обект за движене
	object = new THREE.Mesh(
			new THREE.BoxGeometry(8, 8, 8),
			new THREE.MeshLambertMaterial({color: 'red'})
		);
	object.castShadow = true;
	scene.add(object);
}


class Pillar extends THREE.Mesh
{
	constructor (center, material)
	{
		var height = center.y;
		center = new THREE.Vector3(center.x, 0, center.z);

		if( !material ) material = ground.material;
		
		var spline = new THREE.QuadraticBezierCurve(
				new THREE.Vector3(Math.max(1 + height / 1.5, 10), 0, 0),
				new THREE.Vector3(-3, 0, 0),
				new THREE.Vector3(4, height - 4, 0));

		var points = [];
		for (var i = 0; i <= 32; i++)
		{
			var p = spline.getPoint(i / 32);
			points.push(new THREE.Vector2(p.x, p.y));
		}

		var spline = new THREE.CubicBezierCurve(
				new THREE.Vector3(4, height - 4, 0),
				new THREE.Vector3(4 + 6 * 4 / (height - 4), height, 0),
				new THREE.Vector3(6, height + 5, 0),
				new THREE.Vector3(0.01, height + 5, 0));
		for (var i = 0 + 1; i <= 10; i++)
		{
			var p = spline.getPoint(i / 10);
			points.push(new THREE.Vector2(p.x, p.y));
		}

		super(
				new THREE.LatheGeometry(points, 20),
				material);
		this.castShadow = true;
		this.receiveShadow = true;
		this.position.copy(center);
	}
}

// елемент на робот
var robotMaterial = new THREE.MeshPhongMaterial( {color: 'tomato', shininess: 100} );
	
	
// клас за елемент на робот
function robotElement( sizeX, sizeY, sizeZ, parent )
{
	var robotGeometry = new THREE.BoxGeometry( sizeX, sizeY, sizeZ );
	robotGeometry.translate( 0, sizeY/2, 0 );
	
	var object = new THREE.Mesh( robotGeometry, robotMaterial );
	object.castShadow = true;
		
	// ако има родител, регистрира елемента като негов подобект
	if( parent )
	{
		object.position.set( 0, parent.geometry.parameters.height, 0 );
		parent.add( object );
	}
	
	return object;
}
	
// клас за елемент на робот
function robotElementShape( geometry, length, parent )
{
	var object = new THREE.Mesh( geometry, robotMaterial );
	object.length = length;
	object.castShadow = true;
		
	// ако има родител, регистрира елемента като негов подобект
	if( parent )
	{
		object.position.set( 0, parent.length, 0 );
		parent.add( object );
	}
	
	return object;
}


function orthogonal()
{
	perspective = false;
}


export {
	init, initScene, Pillar, renderer, camera, scene, light, ground,
	object, ambientLight, spotLight, robotMaterial, robotElement, robotElementShape, orthogonal,
	initAnaglyph, initParallax, effect, initVR, showStats };