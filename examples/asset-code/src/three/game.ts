import * as THREE from 'three';

const threeScene = new THREE.Scene();

const planeGeometry = new THREE.PlaneGeometry(200, 200);
const plane = new THREE.Mesh(
  planeGeometry,
  new THREE.MeshStandardMaterial({color: 0x002535}),
);
plane.position.setZ(-5);
plane.receiveShadow = true;
threeScene.add(plane);
threeScene.fog = new THREE.Fog( 0x023348, 30, 80 );

const geometry = new THREE.TetrahedronGeometry(10);
const material = new THREE.MeshPhongMaterial({
  color: 0x14adec,
});
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
threeScene.add(mesh);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.target = threeScene;
directionalLight.position.z = 20;
directionalLight.position.x = -20;
directionalLight.position.y = 20;
directionalLight.castShadow = true;
threeScene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight2.target = threeScene;
directionalLight2.position.z = 20;
directionalLight2.position.x = 40;
directionalLight2.position.y = 20;
threeScene.add(directionalLight2);

const light = new THREE.AmbientLight(0xaaaaaa); // soft white light
threeScene.add(light);

const orbit = new THREE.Group();
const camera = new THREE.PerspectiveCamera(20);
camera.position.set(0, 0, 60);
orbit.add(camera);
orbit.rotation.order = 'ZXY';
orbit.translateZ(3);
orbit.rotation.set(1.2, 0, 1.6);
threeScene.add(orbit);
threeScene.updateWorldMatrix(true, true);

export {threeScene, camera, orbit, geometry, mesh};
