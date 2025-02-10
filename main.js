// Basic Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setClearColor(0x000000, 0); // Transparent background

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);

/// Create a base mountain shape with subdivisions for more detail
const geometry = new THREE.IcosahedronGeometry(2, 3); // More subdivisions = more ruggedness

// Modify the vertex positions to create a mountain shape
const positions = geometry.attributes.position.array;
for (let i = 0; i < positions.length; i += 3) {
    let x = positions[i];
    let y = positions[i + 1];
    let z = positions[i + 2];

    // Make the peak sharper by reducing points near the top
    let heightFactor = Math.pow((y + 2) / 4, 2); // Makes the peak sharper while keeping the base wider

    // Apply randomness (stronger at the top)
    positions[i] += (Math.random() - 0.5) * heightFactor * 0.5; // X-axis
    positions[i + 1] += (Math.random() - 0.5) * heightFactor * 1.5; // Y-axis (taller peaks)
    positions[i + 2] += (Math.random() - 0.5) * heightFactor * 0.5; // Z-axis
}

// Tell Three.js to update the modified geometry
geometry.attributes.position.needsUpdate = true;

// Create material with flat shading for a rougher look
const material = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b, // Brownish mountain
    flatShading: true
});

// Create and position the mountain
const mountain = new THREE.Mesh(geometry, material);
mountain.position.set(0, -1, 0); // Adjust position so it sits properly
scene.add(mountain);

/*
// Load .obj file
const loader = new THREE.OBJLoader();
let mountain3d = null;

loader.load(
    'assets/mountain.obj', // Path to your OBJ file
    function (object) {
        mountain = object;
        mountain.scale.set(2, 2, 2); // Adjust size if necessary
        mountain.position.set(0, -1, 0); // Adjust position
        scene.add(mountain);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
        console.error('Error loading OBJ:', error);
    }
);
*/

// Lighting
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);
// scene.background = new THREE.Color("#FFEA00"); // #982a2a

// Camera Position
camera.position.z = 7;

// Detect mouse movement
let rotationSpeed = 0.0; // Default speed
const maxSpeed = 0.05; // Max rotation speed
const deadzone = 100; // Width of the deadzone in pixels

window.addEventListener("mousemove", (event) => {
    const screenCenter = window.innerWidth / 2;
    const mouseX = event.clientX;

    rotationSpeed = (mouseX - screenCenter) / screenCenter * 0.1;
});

function animate() {
    requestAnimationFrame(animate);
    mountain.rotation.y += rotationSpeed; // Rotate dynamically
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
