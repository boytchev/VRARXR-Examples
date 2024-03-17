/**
 * FMI VR/AR/XR Library
 *
 * 2024-03-17 v1.05 "showStats" defaults to "false", added "outputColorSpace" (Lecture №5)
 * 2024-03-12 v1.04 Added "vaxSceneInit" and "pillar" (Lecture №4)
 * 2024-03-01 v1.03 Export "renderer" and "camera" (Lecture №3)
 * 2024-02-28 v1.02 Export "light" (Lecture №3)
 * 2024-02-26 v1.01 Created (Lecture №2)
 *
 * vaxInit()
 *
 */


import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";


var renderer, scene, camera, light, stats, t, animate, ground, ambientLight, spotLight, object;


var showStats = !true;


function vaxInit( animateLoop )
{
	animate = animateLoop;
	
	renderer = new THREE.WebGLRenderer({antialias: true});
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

	if (showStats) stats.update();

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
	light.intensity = 0.75;

	// околна светлина за по-бледи сенки
	ambientLight = new THREE.AmbientLight('gold', 0.25);
	scene.add(ambientLight);

	// прожекторна светлина за сенки
	spotLight = new THREE.SpotLight('white', 5, 0, 1.0, 1.0);
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
			new THREE.MeshPhongMaterial({color: 'lightgreen'})
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

export {vaxInit, vaxSceneInit, Pillar, renderer, camera, scene, light, ground, object, ambientLight, spotLight};