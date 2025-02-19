export function renderAcceuil(container, loadPage) {
    const acceuil = `
      <div id="three-container"></div>
    `;
  
    container.innerHTML = acceuil;
  
    // Dynamically load mountain.js
    const mountainScript = document.createElement('script');
    mountainScript.src = '/scripts/mountain.js';
    mountainScript.onload = () => {
      // Pass loadPage to mountain.js
      window.loadPage = loadPage;
    };
    document.body.appendChild(mountainScript);
}