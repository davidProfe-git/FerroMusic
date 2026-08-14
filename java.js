
    // Simple Three.js setup for the ferrofluid animation placeholder
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('threejs-container');
        if (!container) return;

        const scene = new THREE.Scene();
        // Transparent background
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Lighting matching 'Midnight Gold'
        const ambientLight = new THREE.AmbientLight(0xffd700, 0.2);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffd700, 1.5, 50);
        pointLight.position.set(2, 2, 2);
        scene.add(pointLight);
        
        const pointLight2 = new THREE.PointLight(0xffaa00, 1, 50);
        pointLight2.position.set(-2, -2, 2);
        scene.add(pointLight2);

        // Blob Geometry
        const geometry = new THREE.IcosahedronGeometry(2, 16); // High detail for smooth morphing
        
        // Premium dark material with gold highlights
        const material = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x3a3000,
            emissiveIntensity: 0.2,
            wireframe: false
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Store original vertices for morphing
        const originalPositions = sphere.geometry.attributes.position.array.slice();
        const numVertices = originalPositions.length / 3;

        let time = 0;

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);

            time += 0.02;

            // Simple noise/displacement simulation
            const positions = sphere.geometry.attributes.position.array;
            
            for (let i = 0; i < numVertices; i++) {
                const ox = originalPositions[i * 3];
                const oy = originalPositions[i * 3 + 1];
                const oz = originalPositions[i * 3 + 2];
                
                // Audio-reactive simulation (using sine waves over time)
                const displacement = 0.2 * Math.sin(time * 2 + ox * 2 + oy * 1.5) * Math.cos(time * 1.5 + oz * 2);
                
                positions[i * 3] = ox + (ox * displacement);
                positions[i * 3 + 1] = oy + (oy * displacement);
                positions[i * 3 + 2] = oz + (oz * displacement);
            }

            sphere.geometry.attributes.position.needsUpdate = true;
            sphere.geometry.computeVertexNormals(); // Recompute normals for proper lighting

            sphere.rotation.y += 0.005;
            sphere.rotation.x += 0.002;

            renderer.render(scene, camera);
        }

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            if(container) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    });

