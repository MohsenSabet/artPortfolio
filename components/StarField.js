import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import styles from '../styles/About.module.css';

export default function StarField() {
  const mountRef = useRef(null);

  useEffect(() => {
    const width = 800;
    const height = 800;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    const currentMount = mountRef.current;
    currentMount && currentMount.appendChild(renderer.domElement);
    const startTime = Date.now();

    const starMeshes = [];
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 1 });
      const star = new THREE.Mesh(geometry, material);
      // assign each star a random oscillation speed and phase
      star.userData.speed = 0.0005 + Math.random() * 0.001;
      star.userData.phase = Math.random() * Math.PI * 2;
      star.position.x = (Math.random() - 0.5) * width;
      star.position.y = (Math.random() - 0.5) * height;
      star.position.z = (Math.random() - 0.5) * 500;
      scene.add(star);
      starMeshes.push(star);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = Date.now() - startTime;
      starMeshes.forEach(star => {
        const { speed, phase } = star.userData;
        // smooth fade using sine wave
        star.material.opacity = 0.05 + 0.03 * Math.sin(elapsed * speed + phase);
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      currentMount && currentMount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div className={styles.starCanvas} ref={mountRef} />;
}
