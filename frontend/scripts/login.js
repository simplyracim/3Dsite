export function renderLogin(container, loadpage) {

    const loginForm = `
      <div class="login-container">
        <h1>Login</h1>
        <form id="login-form">
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    `;
  
    container.innerHTML = loginForm;
  
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        loadpage('acceuil');
    });
}