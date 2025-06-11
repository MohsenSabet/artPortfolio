import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function GlobeButton() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Globe sphere
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    // Use environment mapping for realistic reflections
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 200,
      specular: 0xffffff,
      reflectivity: 1,
      envMap: null,                // will assign from cube camera below
      combine: THREE.MixOperation,
      transparent: false,
      opacity: 1
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Lights: ambient + directional for reflections
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(5, 5, 5);
    scene.add(directional);

    // Cube camera for dynamic environment mapping
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { format: THREE.RGBAFormat });
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    scene.add(cubeCamera);
    // on first frame, update cube camera to capture scene
    cubeCamera.update(renderer, scene);
    material.envMap = cubeRenderTarget.texture;
    material.needsUpdate = true;

    // Animation loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      globe.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }}
    />
  );
}
