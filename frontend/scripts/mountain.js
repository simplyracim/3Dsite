
// import { applyButtonUVMapping } from './uvMapping.js'; // Import the UV mapping function

    /*
    // Load texture for the button
    const textureLoader = new THREE.TextureLoader();
    const buttonTexture = textureLoader.load(buttonTextures[i]);

    // Create button geometry
    const buttonGeometry = new THREE.BoxGeometry(2, 3, 0.1);

    // Apply UV mapping to the geometry
    applyButtonUVMapping(buttonGeometry);

    // Create material with the texture
    const buttonMaterial = new THREE.MeshStandardMaterial({
        map: buttonTexture, // Apply the texture
        color: "#ffffff",   // Base color (white, so texture colors are not altered)
        emissive: "#000000", // No emissive glow by default
        emissiveIntensity: 0
    });
    */
// Encapsulate the Three.js setup in a function
function setupThreeJS(container) {
    // Basic Three.js Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
  
    // Create a rotating mountain (cone geometry)
    const mountainGeometry = new THREE.ConeGeometry(4, 6, 16);
    const mountainMaterial = new THREE.MeshStandardMaterial({ color: "#283047", wireframe: false });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.y = 0.25;
    scene.add(mountain);
  
    const buttonGeometry = new THREE.BoxGeometry(2, 3, 0.1); // Small 'tablet' for buttons
    const buttonMaterial = new THREE.MeshStandardMaterial({ color: "#283047" }); // Red color for buttons
  
    const buttonSupportGeometry = new THREE.BoxGeometry(1.8, 2.8, 2); // Small 'tablet' for buttons
    const buttonSupportMaterial = new THREE.MeshStandardMaterial({ color: "#283047" }); // Red color for buttons
  
    // Array to store buttons
    const buttons = [];
  
    // Create 4 buttons and position them around the mountain
    const buttonTextures = [
      'assets/button1.jpg', // Path to texture for button 1
      'assets/button2.jpg', // Path to texture for button 2
      'assets/button3.jpg', // Path to texture for button 3
      'assets/button4.jpg'  // Path to texture for button 4
    ];
  
    for (let i = 0; i < 4; i++) {
      // Clone the base material so each button has its own instance.
      const uniqueButtonMaterial = buttonMaterial.clone();
      const button = new THREE.Mesh(buttonGeometry, uniqueButtonMaterial);
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 8; // Evenly spaced around the mountain
      const radius = 2.75; // Distance from the center of the mountain when first placing it
      const buttonSupport = new THREE.Mesh(buttonSupportGeometry, buttonSupportMaterial);
      button.position.set(Math.cos(angle) * radius, -0.15, Math.sin(angle) * radius); // Position around the mountain
      button.lookAt(0, 0, 0); // Make the button face the mountain's center
      button.rotateX(Math.PI / 6);
      button.position.y = -0.75;
      button.name = `button${i + 1}`; // Assign a unique name to each button
      buttons.push(button);
      button.castShadow = true;
  
      buttonSupport.castShadow = true;
      buttonSupport.receiveShadow = true;
      button.castShadow = true;
      button.receiveShadow = true;
      mountain.castShadow = true;
      mountain.receiveShadow = true;
  
      mountain.add(button);
      buttonSupport.position.set(0, 0, 1);
      button.add(buttonSupport);
    }
  
    // Lighting
    const sunLight = new THREE.DirectionalLight(0xffaa66, 5); // Warm sunset color
    sunLight.position.set(10, 5, 1); // Low angle for sunset effect
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
  
    // Increase shadow area to cover everything
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 50;
    const ambientLight = new THREE.AmbientLight("#283047", 1); // Warm tint
    scene.add(ambientLight);
  
    scene.add(sunLight);
  
    // Camera Position
    camera.position.z = 10;
    camera.position.y = 0;
  
    // Raycaster and mouse variables for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
  
    // Function to handle mouse clicks
    function onMouseClick(event) {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);
  
      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(buttons);
  
      if (intersects.length > 0) {
        const clickedButton = intersects[0].object;
        // Determine which button was clicked
        if (clickedButton.name === "button1") {
          console.log("Button 1 clicked");
          // Use loadPage to navigate instead of redirecting
          if (typeof loadPage === 'function') {
            loadPage('entreprises');
          }
        } else if (clickedButton.name === "button2") {
          console.log("Button 2 clicked");
          alert("Button 2 clicked!");
        } else if (clickedButton.name === "button3") {
          console.log("Button 3 clicked");
          alert("Button 3 clicked!");
        } else if (clickedButton.name === "button4") {
          console.log("Button 4 clicked");
          alert("Button 4 clicked!");
        }
      }
    }
  
    // Add event listener for mouse clicks
    window.addEventListener("click", onMouseClick, false);
  
    // Detect mouse movement for rotation
    let rotationSpeed = 0.0;
    const maxSpeed = 0.1;
    const deadzone = 20;
  
    window.addEventListener("mousemove", (event) => {
      const screenCenter = window.innerWidth / 2;
      const mouseX = event.clientX;
  
      if (Math.abs(mouseX - screenCenter) > deadzone) {
        rotationSpeed = ((mouseX - screenCenter) / screenCenter) * maxSpeed;
      } else {
        rotationSpeed = 0; // No rotation inside the deadzone
      }
    });
  
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
  
      // Rotate the mountain dynamically
      mountain.rotation.y += rotationSpeed;
  
      // Rotate the buttons around the mountain
      buttons.forEach((button, index) => {
        const angle = (mountain.rotation.y * -1) + (index * Math.PI / 2); // Time-based angle + offset for each button
      });
  
      renderer.render(scene, camera);
  
      // THE NOITA GLOW
      let closestButton = null;
      let minDistance = Infinity;
  
      buttons.forEach(button => {
        const distance = camera.position.distanceTo(button.getWorldPosition(new THREE.Vector3()));
  
        if (distance < minDistance) {
          minDistance = distance;
          closestButton = button;
        }
      });
  
      // Apply gradual glow effect only to the closest button
      buttons.forEach(button => {
        if (button === closestButton) {
          const intensity = Math.max(0, 7.75 - (camera.position.distanceTo(button.getWorldPosition(new THREE.Vector3())))) * 2;
          button.material.emissive = new THREE.Color(0xffff00).multiplyScalar(intensity);
          button.material.emissiveIntensity = intensity;
        } else {
          button.material.emissive.setHex(0x000000); // Reset others
          button.material.emissiveIntensity = 0;
        }
      });
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
  }
  
  // Initialize Three.js when the script is loaded
  const threeContainer = document.createElement('div');
  threeContainer.id = 'three-container';
  document.body.appendChild(threeContainer);
  setupThreeJS(threeContainer);