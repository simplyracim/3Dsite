const app = document.getElementById('app');

function loadpage(page) {
    // Clear the current content
    app.innerHTML = '';

    // Load the corresponding JavaScript file
    switch (page) {
    case 'login':
        import('./login.js').then((module) => {
        module.renderLogin(app, loadpage);
        });
        break;
    case 'acceuil':
        import('./acceuil.js').then((module) => {
        module.renderAcceuil(app, loadpage);
        });
        break;
    case 'entreprises':
        import('./entreprises.js').then((module) => {
        module.renderEntreprises(app, loadpage);
        });
        break;
    default:
        app.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
}

loadpage('login');