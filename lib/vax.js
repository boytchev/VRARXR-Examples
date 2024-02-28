/**
 * FMI VR/AR/XR Library
 *
 * 2024-02-28 v1.002 Export "light" (Lecture №3)
 * 2024-02-26 v1.001 Created (Lecture №2)
 *
 * vaxInit()
 *
 */


import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";


var renderer, scene, camera, light, stats, t, animate;


function vaxInit( animateLoop )
{
	animate = animateLoop;
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	document.body.appendChild(renderer.domElement);
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';

	stats = new Stats();
	document.body.appendChild(stats.dom);

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


function frame(time)
{
	if (animate)
		animate(time / 1000);

	stats.update();

	renderer.render(scene, camera);
}


export {vaxInit, scene, light};