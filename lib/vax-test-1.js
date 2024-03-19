/**
 * FMI VR/AR/XR Library for Test 1
 *
 */

import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
			
var renderer, scene, camera, light, stats, t, animate, ground, ambientLight, spotLight, object;

var showStats = !true;

function vaxInit(animateLoop)
{
	animate = animateLoop;

	renderer = new THREE.WebGLRenderer(
	{
		antialias: true
	}
		);
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

	document.body.appendChild(renderer.domElement);
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';

	if (showStats)
	{
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

	scene = new THREE.Scene();
	scene.background = new THREE.Color('white');

	camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
	camera.position.set(0, 0, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	light = new THREE.PointLight('white', 2);
	light.decay = 0;
	light.position.set(0, 150, 300);
	scene.add(light);

	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();

	renderer.setAnimationLoop(frame);
}

function onWindowResize(event)
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight, true);
}

var oldTime = 0;
var accTime = 0;
function frame(time)
{
	// защита от прекалено голяма скорост, при по-бързи компютри някои анимации
	// ще са прекалено бързи, затова изкуствено се забавя до 60 fps
	accTime += time - oldTime;
	oldTime = time;
	if (accTime < 1000 / 60)
		return;
	accTime = 0;

	if (animate)
		animate(time / 1000);

	if (showStats)
		stats.update();

	renderer.render(scene, camera);
}

// Общи настройки на сцената
function vaxSceneInit(animateLoop)
{
	showStats = false;

	vaxInit(animateLoop);

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
		new THREE.BoxGeometry(200,4,50,200*2,1,50*2),
		new THREE.MeshPhongMaterial({color:'gold',shininess:100})
	);
	var pos = ground.geometry.getAttribute( 'position' );
	for( var i=0; i<pos.count; i++ )
	{
		var x = pos.getX(i),
			y = pos.getY(i),
			z = pos.getZ(i);
//		if( y>0.5 ) pos.setY( i, y+3*( (11/(0.1+x*x))%1+(11/(0.1+z*z))%1) );
		if( y>0 && z<23 && z>-23 && x<98 && x>-98 ) pos.setY( i, y-1-0.5*Math.random() );
	}
	ground.geometry.computeVertexNormals();
	ground.position.set( 0, -2, 0 );
	ground.receiveShadow = true;
	scene.add( ground );

	// обект за движене
	object = new THREE.Mesh(
		new THREE.IcosahedronGeometry(2,7),
		new THREE.MeshPhongMaterial({color:'dodgerblue',shininess:100})
	);
	object.scale.z = 5;
	object.castShadow = true;
	scene.add( object );

	// орбитална навигация
	new OrbitControls( camera, renderer.domElement );

}

class Pillar extends THREE.Mesh
{
	constructor(center, material)
	{
		var height = center.y;
		center = new THREE.Vector3(center.x, 0, center.z);

		if (!material)
			material = ground.material;

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
var robotMaterial = new THREE.MeshPhongMaterial(
{
	color: 'crimson',
	shininess: 100
}
);

// клас за елемент на робот
function robotElement(sizeX, sizeY, sizeZ, parent)
{
	var robotGeometry = new THREE.CylinderGeometry(0.2, 1, 1);
	robotGeometry.scale(sizeX, sizeY, sizeZ);
	robotGeometry.translate(0, sizeY / 2, 0);

	var object = new THREE.Mesh(robotGeometry, robotMaterial);
	object.length = sizeY;
	object.castShadow = true;
	object.receiveShadow = true;

	var joint = new THREE.Mesh(
			new THREE.CylinderGeometry(1.25 * sizeX, 1.25 * sizeX, 2.5 * sizeZ),
			new THREE.MeshBasicMaterial(
			{
				color: 0
			}
			));
	joint.rotation.x = Math.PI / 2;
	joint.castShadow = true;
	joint.receiveShadow = true;
	object.add(joint);

	// ако има родител, регистрира елемента като негов подобект
	if (parent)
	{
		object.position.set(0, parent.length, 0);
		parent.add(object);
	}

	return object;
}

// клас за елемент на робот
function robotElementShape(geometry, length, parent)
{
	var object = new THREE.Mesh(geometry, robotMaterial);
	object.length = length;
	object.castShadow = true;

	// ако има родител, регистрира елемента като негов подобект
	if (parent)
	{
		object.position.set(0, parent.length, 0);
		parent.add(object);
	}

	return object;
}


var pose = {};

vaxSceneInit(animate2);

// първи елемент на робот
var a = robotElement( 2, 40, 5 );
scene.add( a );

// втори елемент
var b = robotElement( 0.75, 37.5, 2, a );
var end = new THREE.Mesh(
			new THREE.TorusGeometry(3,1,20,50),
			robotMaterial
		);
end.position.y = 40;
end.castShadow = true;
b.add( end );

function animate2()
{
	a.rotation.z = THREE.MathUtils.degToRad( pose.alpha-90 );
	b.rotation.z = THREE.MathUtils.degToRad( 180-pose.beta );
}


export
{
	vaxInit,
	vaxSceneInit,
	Pillar,
	renderer,
	camera,
	scene,
	light,
	object,
	ambientLight,
	spotLight,
	robotMaterial,
	robotElement,
	robotElementShape,
	pose
};
