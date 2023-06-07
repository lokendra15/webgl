import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import dat from "dat.gui";

function CubeRenderer({width = '300px', height = '300px'}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let renderer, scene, camera, controls, gui, model;

    const init = () => {
      // Create a renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Create a scene
      scene = new THREE.Scene();

      // Create a camera
      camera = new THREE.PerspectiveCamera(105, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
      camera.position.set(1, 1, 3);

      // Create controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.update();

      // Create GUI
      gui = new dat.GUI();
      const options = {
        coatColor: '#ffea00'
      };

      // Load the GLB file
      const loader = new GLTFLoader();
      loader.load(
        './3d_modal_download.glb',
        (gltf) => {
          model = gltf.scene;

          // Access the material and change its color
          model.traverse(function (child) {
            if (child.isMesh && child.material.name === 'Coat') {
              child.material.emissive = new THREE.Color(options.coatColor);
              gui.addColor(options, 'coatColor').onChange(function (e) {
                child.material.emissive.set(e);
              });
              child.position.y = 0.6;
            }
          });

          scene.add(model);
        },
        undefined,
        (error) => {
          console.error('An error occurred loading the GLB file', error);
        }
      );

      gui.add({ showCoat: true }, 'showCoat').onChange((value) => {
        model.traverse(function (child) {
          if (child.isMesh && child.material.name === 'Coat') {
            child.visible = value;
          }
        });
      });

      // Create a grid helper
      const size = 10;
      const divisions = 10;
      const gridHelper = new THREE.GridHelper(size, divisions);
      scene.add(gridHelper);

      // Create lights
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(-3, 10, -10);
      scene.add(dirLight);

      // Create an animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };

      // Start the animation loop
      animate();

      return () => {
        // Clean up the resources
        renderer.dispose();
      };
    };

    // Initialize the renderer
    init();
  }, []);


  return <div ref={containerRef} style={{ width: width, height: height }} />;
}

export default CubeRenderer;
