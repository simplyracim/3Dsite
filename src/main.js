import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// Scene setup
const scene = new THREE.Scene();

// Create renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Append renderer to container
const container = document.querySelector('#three-container');
if (container) {
    container.appendChild(renderer.domElement);
} else {
    console.error('Container #three-container not found');
}

// Create gradient background
const bgCanvas = document.createElement('canvas');
bgCanvas.width = 2;
bgCanvas.height = 512;

const bgCtx = bgCanvas.getContext('2d');
const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);

gradient.addColorStop(0, '#05204f');
gradient.addColorStop(0.3, '#083064');
gradient.addColorStop(0.6, '#0a4585');
gradient.addColorStop(1, '#0c67a3');
bgCtx.fillStyle = gradient;
bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

const texture = new THREE.CanvasTexture(bgCanvas);
texture.needsUpdate = true;
scene.background = texture;

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 17, 45);

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
);
composer.addPass(bloomPass);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(-5, -5, -5);
scene.add(pointLight);

// Rotation Variables
let mountain = null;
let textMesh = null;  // Add textMesh to global scope
let rotationSpeed = 0.0;
const maxSpeed = 0.2; // Augmenté de 0.05 à 0.2 pour une rotation plus rapide
let isRotationPaused = false; // Flag to track if rotation is paused

// Mouse Movement Listener
window.addEventListener("mousemove", (event) => {
    const screenCenter = window.innerWidth / 2;
    const mouseX = event.clientX;
    rotationSpeed = (mouseX - screenCenter) / screenCenter * maxSpeed;
});

// Add these variables after the existing rotation variables
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let intersectedObject = null;

// Add this function after the existing event listeners
function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        // Check if the clicked object is one of our signs
        if (clickedObject.userData.isSign) {
            if (clickedObject.userData.signType === 'offres') {
                window.location.href = '/Gestion_offres.html';
            } else if (clickedObject.userData.signType === 'entreprises') {
                window.location.href = '/Gestion_des_entreprises.html';
            }
        }
        // Check if the clicked object has Material.001
        else if (clickedObject.material && clickedObject.material.name === 'Material.001') {
            window.location.href = '/Gestion_pilote.html';
        }
        // Check if the clicked object has Material.002
        else if (clickedObject.material && clickedObject.material.name === 'Material.002') {
            window.location.href = '/Gestion_etudiant.html';
        }
    }
}

// Add this function for hover effects
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Reset previously intersected object
    if (intersectedObject) {
        intersectedObject.material.emissive.setHex(0x000000);
    }

    // Find the first intersected object
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        // Check if the intersected object is a sign, Material.001, or Material.002
        if (object.userData.isSign || 
            (object.material && (object.material.name === 'Material.001' || object.material.name === 'Material.002'))) {
            object.material.emissive.setHex(0x333333); // Add glow effect
            intersectedObject = object;
        } else {
            intersectedObject = null;
        }
    } else {
        intersectedObject = null;
    }
}

// Add these variables after the existing rotation variables
let rotationAxis = 'y'; // 'y' for Y-axis rotation, 'x' for X-axis rotation

// Add this event listener after the existing mouse movement listener
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        isRotationPaused = !isRotationPaused;
        event.preventDefault(); // Prevent page scroll on spacebar
    }
    
    if (event && event.key && event.key.toLowerCase() === 'r') {
        rotationAxis = rotationAxis === 'y' ? 'x' : 'y';
        // Reset rotation speed when switching axes
        rotationSpeed = 0;
    }
});

// Add these variables at the top of the file, after imports
let userType = 'etudiant'; // Default user type
const popupMenu = document.getElementById('popup-menu');
let isLoggedIn = false;
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const welcomeText = document.querySelector('.welcome-text');

// Function to update welcome message
function updateWelcomeMessage(userData) {
    if (welcomeText && userData.nom && userData.prenom) {
        welcomeText.textContent = `Bienvenue ${userData.prenom} ${userData.nom} au`;
    }
}

// Update the scroll handler to include popup menu
function handleScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const halfPage = documentHeight / 2;
    
    // Only show popup menu if logged in
    if (isLoggedIn) {
        // Show/hide popup menu based on scroll position
        if (scrollPosition > 100 && scrollPosition < halfPage) {
            popupMenu.classList.add('visible');
            // Set the user type data attribute
            popupMenu.setAttribute('data-user-type', userType);
            
            // Adapter le menu selon la taille d'écran
            adjustPopupMenuSize();
        } else {
            popupMenu.classList.remove('visible');
        }
    }
    
    // Handle login form opacity
    if (scrollPosition > 100) {
        const opacity = Math.max(0, 1 - (scrollPosition - 100) / 300);
        loginForm.style.opacity = opacity;
        
        if (opacity < 0.1) {
            loginForm.style.pointerEvents = 'none';
        } else {
            loginForm.style.pointerEvents = 'auto';
        }
    } else {
        loginForm.style.opacity = 1;
        loginForm.style.pointerEvents = 'auto';
    }
}

// Fonction pour ajuster la taille du menu popup en fonction de la taille de l'écran
function adjustPopupMenuSize() {
    const screenWidth = window.innerWidth;
    
    // Utiliser les media queries CSS pour adapter le menu,
    // mais on peut aussi ajuster certains styles spécifiques ici
    if (screenWidth <= 375) {
        // Très petits écrans
        popupMenu.style.fontSize = '0.8rem';
    } else if (screenWidth <= 576) {
        // Petits écrans
        popupMenu.style.fontSize = '0.9rem';
    } else {
        // Écrans normaux
        popupMenu.style.fontSize = '1rem';
    }
}

// Écouter l'événement de redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    // Si le menu est visible, ajuster sa taille
    if (popupMenu.classList.contains('visible')) {
        adjustPopupMenuSize();
    }
});

// Écouter l'événement de scroll
window.addEventListener('scroll', handleScroll);

// Initialiser l'état du formulaire
handleScroll();

// Add event listeners after the existing ones
window.addEventListener('click', onMouseClick);
window.addEventListener('mousemove', onMouseMove);

// Add login form submission handler
document.querySelector('.login-form form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Empêcher la soumission normale du formulaire
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost/3Dsite%20version%201.3/login.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
            return;
        }

        if (data.success) {
            isLoggedIn = true;
            userType = data.role;
            loginForm.style.display = 'none';
            logoutBtn.style.display = 'block';
            document.body.classList.add('scrollable');
            
            // Update welcome message with user data
            updateWelcomeMessage(data);
            
            // Charger la montagne après connexion réussie
            loadMountain();
            
            // Réinitialiser le formulaire
            this.reset();
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur lors de la connexion. Veuillez réessayer.');
    }
});

// Modify checkSession function to handle errors better
async function checkSession() {
    try {
        const response = await fetch('http://localhost/3Dsite%20version%201.3/check_session.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.loggedIn) {
            isLoggedIn = true;
            userType = data.role;
            loginForm.style.display = 'none';
            logoutBtn.style.display = 'block';
            document.body.classList.add('scrollable');
            
            // Update welcome message with user data
            updateWelcomeMessage(data);
            
            // Charger la montagne seulement si connecté
            loadMountain();
        } else {
            isLoggedIn = false;
            userType = 'etudiant';
            loginForm.style.display = 'block';
            logoutBtn.style.display = 'none';
            document.body.classList.remove('scrollable');
            
            // Reset welcome message
            if (welcomeText) {
                welcomeText.textContent = 'Bienvenue au';
            }
            
            // Nettoyer la scène si une montagne existe
            if (mountain) {
                scene.remove(mountain);
                mountain.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                });
                mountain = null;
            }
        }
    } catch (error) {
        console.error('Error checking session:', error);
        isLoggedIn = false;
        loginForm.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
    
    // Toujours démarrer l'animation pour maintenir le fond visible
    animate();
}

// Add logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost/3Dsite%20version%201.3/login.php?action=logout', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            isLoggedIn = false;
            userType = 'etudiant';
            loginForm.style.display = 'block';
            logoutBtn.style.display = 'none';
            document.body.classList.remove('scrollable');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
});

// Function to load the appropriate mountain
function loadMountain() {
    console.log('Loading mountain for user type:', userType);
    
    // Nettoyer la montagne existante si elle existe
    if (mountain) {
        scene.remove(mountain);
        mountain.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        mountain = null;
    }

    const mtlLoader = new MTLLoader();
    let mtlPath, objPath;
    
    switch(userType) {
        case 'pilote':
            mtlPath = '/public/assets/mountainpilote.mtl';
            objPath = '/public/assets/mountainpilote.obj';
            break;
        case 'admin':
            mtlPath = '/public/assets/mountainadmin.mtl';
            objPath = '/public/assets/mountainadmin.obj';
            break;
        default:
            mtlPath = '/public/assets/MountainDef.mtl';
            objPath = '/public/assets/mountainDef.obj';
    }

    mtlLoader.load(mtlPath, (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        objLoader.load(objPath, (object) => {
            mountain = object;
            
            mountain.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.computeVertexNormals();
                    child.geometry.computeBoundingSphere();
                    
                    child.material.side = THREE.DoubleSide;
                    child.material.needsUpdate = true;
                    
                    child.castShadow = true;
                    child.receiveShadow = true;

                    if (child.material.name === 'wood_texture' || child.material.name === 'wood_texture.001') {
                        child.userData.isSign = true;
                        child.userData.signType = child.material.name === 'wood_texture.001' ? 'entreprises' : 'offres';
                        child.material.emissive = new THREE.Color(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                    else if (child.material.name === 'Material.001' || child.material.name === 'Material.002') {
                        child.material.emissive = new THREE.Color(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                }
            });
            
            mountain.scale.set(1, 1, 1);
            mountain.position.set(0, 0, 0);
            scene.add(mountain);
            
            renderer.compile(scene, camera);
            composer.render();
        });
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (mountain && !isRotationPaused) {
        if (rotationAxis === 'y') {
            mountain.rotation.y += rotationSpeed;
        } else {
            mountain.rotation.x += rotationSpeed * 2;
        }
    }
    
    composer.render();
}

// Resize handler
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    composer.setSize(width, height);
});

// Start animation
animate();

// Call checkSession when the page loads
checkSession();