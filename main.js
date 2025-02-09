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