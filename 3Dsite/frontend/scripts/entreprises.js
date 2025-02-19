export function renderEntreprises(container, loadpage) {

    const entreprises = `
        <div>'bienvenue à entreprises, cette page est un placeholder'</div>
        <button id = "myButton">Revenir à la page d'acceuil</button>
    `;

    container.innerHTML = entreprises;

    const button = document.getElementById('myButton');
    button.addEventListener('click', function() {
        loadpage('login');
    });
}