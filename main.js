    // Basic Three.js Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setClearColor(0x000000, 0); // Transparent background

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("three-container").appendChild(renderer.domElement);

    // Create a rotating mountain (simple geometry for now)
    const geometry = new THREE.ConeGeometry(2, 3, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, wireframe: false });
    const mountain = new THREE.Mesh(geometry, material);
    scene.add(mountain);

    // Lighting
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    scene.background = new THREE.Color("#982a2a"); // Light blue (sky color)

    // Camera Position
    camera.position.z = 5;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        mountain.rotation.y += 0.01; // Rotate
        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
