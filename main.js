import './style.css';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'

// Setup

const container = document.getElementById( 'bg' );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 90 );
camera.position.set( 0, 0, -6);
scene.add( camera );

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera);

// Controls

const controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 0.5;
				controls.maxDistance = 9;
        controls.minDistance = 1;

// Terra

const terraTexture = new THREE.TextureLoader().load('terra_night_texture.jpeg');
const bumpMap = new THREE.TextureLoader().load('8k_earth_specular_map.jpg');
const normalTexture = new THREE.TextureLoader().load('8k_earth_normal_map.jpg');

const terra = new THREE.Mesh(
  new THREE.SphereGeometry(3, 36, 36),
  new THREE.MeshStandardMaterial({
    map: terraTexture,
    bumpMap,
    normalMap: normalTexture
  })
);

scene.add(terra);

// Bloom

const renderScene = new RenderPass( scene, camera );

const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
};

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;

				let composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );


// Lights

const pointLight = new THREE.PointLight( 0xffffff, 1 );
				camera.add( pointLight );

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

const randomSize = () => {
  return Math.random() * .15
}

function addStar() {
  const geometry = new THREE.SphereGeometry(randomSize(), 24, 24);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load('void.jpeg');
scene.background = spaceTexture;

// Scroll Animation

// function moveCamera() {
//   const t = document.body.getBoundingClientRect().top;

//   camera.position.z = t * -0.01;
//   camera.position.x = t * -0.0002;
//   camera.rotation.y = t * -0.0002;
// }

// document.body.onscroll = moveCamera;
// moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  terra.rotation.y += 0.01

  controls.update();

  renderer.render(scene, camera);
}

animate();