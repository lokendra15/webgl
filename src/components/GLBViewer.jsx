import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

function GLBViewer({ glbPath }) {
  const containerRef = useRef(null);
  const [showCoat, setShowCoat] = useState(true);
  const [coatColor, setCoatColor] = useState('#ffea00');
  const rendererRef = useRef(null);
  const guiRef = useRef(null);
  const modelRef = useRef(null);
  const colorRef = useRef({ coatColor });

  useEffect(() => {
    let renderer, scene, camera, controls, model, coatMaterial;

    const init = () => {
      // Create a renderer if created
      if (!rendererRef.current) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
      } else {
        renderer = rendererRef.current;
      }

      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Create a scene
      scene = new THREE.Scene();

      // Create a camera
      camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
      camera.position.z = 3;
      camera.position.y = 1;

      // Create controls
      controls = new OrbitControls(camera, renderer.domElement);

      // Load the GLB file
      const loader = new GLTFLoader();
      loader.load(
        glbPath,
        (gltf) => {
          model = gltf.scene;
          modelRef.current = model;

          // Access the material and change its color
          model.traverse(function (child) {
            if (child.isMesh && child.material.name === 'Coat') {
              coatMaterial = child.material;
              //child.position.y = 0.6;
              child.visible = showCoat;
              coatMaterial.emissive = new THREE.Color(coatColor);
            }
          });

          scene.add(model);
        },
        undefined,
        (error) => {
          console.error('An error occurred loading the GLB file', error);
        }
      );

      // Create a grid helper
      const size = 10;
      const divisions = 10;
      const gridHelper = new THREE.GridHelper(size, divisions);
      scene.add(gridHelper);

      // Create lights
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      // Create GUI
      if (!guiRef.current) {
        guiRef.current = new dat.GUI();
        const gui = guiRef.current;
        const controls = gui.add({ showCoat: showCoat }, 'showCoat');
        controls.name(showCoat ? 'Hide Coat' : 'Show Coat');
        controls.onChange((value) => {
          setShowCoat(value);
          if (modelRef.current) {
            modelRef.current.traverse(function (child) {
              if (child.isMesh && child.material.name === 'Coat') {
                child.visible = value;
              }
            });
          }
        });
        gui.addColor(colorRef.current, 'coatColor').onChange((value) => {
          setCoatColor(value);
          if (coatMaterial) {
            coatMaterial.emissive.set(value);
          }
        });
      }

      // Create an animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        // Rotate the model
        // if (model) {
        //   model.rotation.y += 0.01;
        // }

        // Render the scene
        renderer.render(scene, camera);
      };

      // Start the animation loop
      animate();

      // Handle window resize event
      const onWindowResize = () => {
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };

      window.addEventListener('resize', onWindowResize);

      return () => {
        // Clean up the resources
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
        rendererRef.current = null;

        // Remove the window resize event listener
        window.removeEventListener('resize', onWindowResize);
      };
    };

    // Initialize the viewer
    init();
  }, [glbPath, showCoat, coatColor]);

  useEffect(() => {
    return () => {
      // Clean up the renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.domElement = null;
        rendererRef.current = null;
      }

      // Clean up the GUI
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '400px', height: '400px' }} />;
}

export default GLBViewer;
