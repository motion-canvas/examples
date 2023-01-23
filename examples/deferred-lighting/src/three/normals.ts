import * as THREE from 'three';

const threeScene = new THREE.Scene();

const radius = 1;
const geometry = new THREE.SphereGeometry(radius, 32, 32);
const material = new THREE.MeshPhongMaterial({color: 0x4444444});
const materialO = new THREE.MeshLambertMaterial({
  color: 0x444444,
  opacity: 0.3,
  transparent: true,
});
const cube = new THREE.Mesh(geometry, material);
const sphere = new THREE.Mesh(geometry, materialO);
threeScene.add(cube, sphere);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.target = cube;
directionalLight.position.z = 20;
directionalLight.position.x = -20;
directionalLight.position.y = 20;
threeScene.add(directionalLight);

const light = new THREE.AmbientLight(0x888888); // soft white light
threeScene.add(light);

const arrowSize = 0.5;
function makeArrow(): [THREE.Group, THREE.MeshBasicMaterial] {
  const arrowMaterial = new THREE.MeshBasicMaterial({color: 0xff6470});
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.2, 32),
    arrowMaterial,
  );
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, arrowSize, 32),
    arrowMaterial,
  );
  cone.position.setY(arrowSize + 0.1);
  cylinder.position.setY(arrowSize / 2);

  const arrow = new THREE.Group();
  arrow.add(cone, cylinder);
  return [arrow, arrowMaterial];
}

const [arrow, arrowMaterial] = makeArrow();
const [arrowA, arrowMaterialA] = makeArrow();
const [arrowB, arrowMaterialB] = makeArrow();
const [arrowC, arrowMaterialC] = makeArrow();
arrowA.rotation.set(Math.PI / 2, 0, 0);
arrowA.position.setY(1);
arrowA.scale.setScalar(0);

arrowB.rotation.set(Math.PI / 2, 0, 0);
arrowB.position.setX(-1);
arrowB.scale.setScalar(0);

arrowC.rotation.set(Math.PI / 2, 0, 0);
arrowC.position.setY(-1);
arrowC.scale.setScalar(0);

arrow.position.setY(radius);

const arrows = new THREE.Group();
arrows.add(arrow);
threeScene.add(arrows, arrowA, arrowB, arrowC);

const orbit = new THREE.Group();
const camera = new THREE.OrthographicCamera();
camera.position.set(0, 0, 10);
orbit.add(camera);
threeScene.add(orbit);
// camera.lookAt(new THREE.Vector3(0, 0, 0));

export {
  threeScene,
  camera,
  cube,
  arrows,
  orbit,
  arrow,
  arrowA,
  arrowB,
  arrowC,
  sphere,
  arrowMaterial,
  arrowMaterialA,
  arrowMaterialB,
  arrowMaterialC,
};
