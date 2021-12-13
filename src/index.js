import * as THREE from 'https://cdn.skypack.dev/three';

import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/ShaderPass.js'
import { FontLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/FontLoader.js';
import { getCoordinatesHandler } from './api';
import forecast from '../src/forecast';
import geocode from '../src/geocode';

const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const params = {
    exposure: 1,
    bloomStrength: 5,
    bloomThreshold: 0,
    bloomRadius: 0,
    scene: "Scene with Glow"
};

const darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
const materials = {};

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 200 );
camera.position.set( 0, 0, 45 );
camera.lookAt( 0, 0, 0 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1;
controls.maxDistance = 90;
controls.addEventListener( 'change', render );

scene.add( new THREE.AmbientLight( 0x404040 ) );

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        defines: {}
    } ), "baseTexture"
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();

// Get Weather Report

const setLocationHandler = async () => {
    const coords = getCoordinatesHandler();
      geocode(
        coords,
        (error, { latitude, longitude, location } = {}) => {
            if (error) {
                console.log(error);
            }
            fontLoader(loadingText, 'Loading Weather...', 12)
            forecast(longitude, latitude, (error, currentForecast) => {
                let messageOne = 'Location: ' + location
                fontLoader(locationText, messageOne, 9)
                fontLoader(weatherText, currentForecast, 3)
                scene.remove( loadingText )
                
                if (error) {
                    console.log(error);
                }
            });
        }
    );
}


// Event listeners

window.addEventListener( 'dblclick', onPointerDown );

let active = false;
window.addEventListener( 'touchmove', () => {
    if (!active) {
        scene.remove( welcomeText );
        setLocationHandler()
        active = true;
    }
});

setupScene();

function onPointerDown( event ) {

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children, false );

    if ( intersects.length > 0 ) {
        const object = intersects[ 0 ].object;
        // object.layers.toggle( BLOOM_SCENE );
        scene.remove( welcomeText );
        setLocationHandler()
        render();
    }
}

// Resize adjustments

window.onresize = function () {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );

    bloomComposer.setSize( width, height );
    finalComposer.setSize( width, height );

    render();

};

function setupScene() {

    scene.traverse( disposeMaterial );
    scene.children.length = 0;

    // Random colors

    const color = new THREE.Color();
        color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );    

    // Terra assets

    const terraGeometry = new THREE.SphereGeometry( 6, 60, 60 );
    // const map = new THREE.TextureLoader().load('8k_earth_specular_map.jpg');
    const material = new THREE.MeshBasicMaterial( { color: 0xe6f0ff } );

    const terra = new THREE.Mesh( terraGeometry, material );

    terra.layers.enable( BLOOM_SCENE )
    scene.add(terra);

    // Star assets
    
    const randomSize = () => {
        return Math.random() * .21
      }
    const starGeometry = new THREE.SphereGeometry(randomSize(), 24, 24);

    for ( let i = 0; i < 90; i ++ ) {

        const color = new THREE.Color();
        color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );

        const material = new THREE.MeshBasicMaterial( { color } );
        const star = new THREE.Mesh( starGeometry, material );
        const [x, y, z] = Array(3)
            .fill()
            .map(() => THREE.MathUtils.randFloatSpread(100));

        star.position.set(x, y, z);
        scene.add( star );

        star.layers.enable( BLOOM_SCENE );

    }

    render();

}

function disposeMaterial( obj ) {
    if ( obj.material ) {
        obj.material.dispose();
    }
}

function render() {
    switch ( params.scene ) {
        case 'Scene only':
            renderer.render( scene, camera );
            break;
        case 'Glow only':
            renderBloom( false );
            break;
        case 'Scene with Glow':
        default:
            // render scene with bloom
            renderBloom( true );
            // render the entire scene, then render bloom scene on top
            finalComposer.render();
            break;
    }
}

function renderBloom( mask ) {
    if ( mask === true ) {
        scene.traverse( darkenNonBloomed );
        bloomComposer.render();
        scene.traverse( restoreMaterial );
    } else {
        camera.layers.set( BLOOM_SCENE );
        bloomComposer.render();
        camera.layers.set( ENTIRE_SCENE );
    }
}

function darkenNonBloomed( obj ) {
    if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
        materials[ obj.uuid ] = obj.material;
        obj.material = darkMaterial;
    }

}

function restoreMaterial( obj ) {
    if ( materials[ obj.uuid ] ) {
        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];
    }
}

// 3D Text

const loader = new FontLoader();
const welcomeText = new THREE.Object3D();
const locationText = new THREE.Object3D();
const weatherText = new THREE.Object3D();
const loadingText = new THREE.Object3D();

function fontLoader(text, message, coordsY) {
    loader.load( './helvetiker_regular.typeface.json', function ( font ) {

        const color = 0x006699;

        const matDark = new THREE.LineBasicMaterial( {
            color: color,
            side: THREE.DoubleSide
        } );

        const matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        } );

        const shapes = font.generateShapes( message, 3 );
        const geometry = new THREE.ShapeGeometry( shapes );

        geometry.computeBoundingBox();

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        geometry.translate( xMid, 0, 0 );

        // make shape ( N.B. edge view not visible )

        // const text = new THREE.Mesh( geometry, matLite );
        // text.position.z = - 30;
        // scene.add( text );

        // make line shape ( N.B. edge view remains visible )

        const holeShapes = [];

        for ( let i = 0; i < shapes.length; i ++ ) {

            const shape = shapes[ i ];

            if ( shape.holes && shape.holes.length > 0 ) {

                for ( let j = 0; j < shape.holes.length; j ++ ) {

                    const hole = shape.holes[ j ];
                    holeShapes.push( hole );

                }

            }

        }

        shapes.push.apply( shapes, holeShapes );

        for ( let i = 0; i < shapes.length; i ++ ) {

            const shape = shapes[ i ];

            const points = shape.getPoints();
            const geometry = new THREE.BufferGeometry().setFromPoints( points );

            geometry.translate( xMid, 0, 0 );

            const lineMesh = new THREE.Line( geometry, matDark );
            text.add( lineMesh );
        }

        text.position.z = -30;
        text.position.y = coordsY;

        scene.add( text );

        render();
    } );
}

fontLoader(welcomeText, 'Welcome!', 15)