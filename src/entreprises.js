// Scene setup for background
var vertexHeight = 125000;
var planeDefinition = 20;
var planeSize = 1245000;
var totalObjects = 500;

var container = document.getElementById('three-container');

var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2500000);
camera.position.z = 670000;
camera.position.y = 10000;
camera.lookAt(new THREE.Vector3(0, 6000, 0));

var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 100000, 400000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: false });

var plane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition), planeMaterial);
plane.rotation.x = -Math.PI * 1.5;
plane.position.y = 20000;
scene.add(plane);

var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition), planeMaterial);
plane2.rotation.x = -Math.PI * 0.5;
scene.add(plane2);

// Particle background
var particleGeometry = new THREE.BufferGeometry();
var positions = new Float32Array(totalObjects * 3);

for (var i = 0; i < totalObjects; i++) {
    var index = i * 3;
    positions[index] = Math.random() * planeSize - (planeSize * 0.5);
    positions[index + 1] = (Math.random() * 100000) - 10000;
    positions[index + 2] = Math.random() * planeSize - (planeSize * 0.5);
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

var material = new THREE.PointsMaterial({ size: 200, color: 0xffffff });
var particles = new THREE.Points(particleGeometry, material);

scene.add(particles);

updatePlane(plane);
updatePlane(plane2);

function updatePlane(obj) {
    var vertices = obj.geometry.attributes.position.array;
    for (var i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] += Math.random() * vertexHeight - vertexHeight;
    }
    obj.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

function render() {
    requestAnimationFrame(render);
    camera.position.z -= 150;
    renderer.render(scene, camera);
}

render();

// GESTION DES ENTREPRISES
document.addEventListener('DOMContentLoaded', async function() {
    // Variables globales pour le dashboard
    let allCompanies = [];
    let filteredCompanies = [];
    let currentPage = 1;
    const itemsPerPage = 5;
    let userRole = '';
    let sortOption = 'alphabetical'; // Option de tri par défaut
    
    // Éléments DOM
    const companiesList = document.getElementById('companies-list');
    const searchInput = document.getElementById('dashboard-search-input');
    const searchBtn = document.getElementById('dashboard-search-btn');
    const sortSelect = document.getElementById('sort-options');
    const refreshBtn = document.getElementById('refresh-dashboard');
    const pagination = document.getElementById('dashboard-pagination');
    
    // Boutons de navigation
    const searchButton = document.getElementById('searchBtn');
    const createButton = document.getElementById('createBtn');
    const editButton = document.getElementById('editBtn');
    const deleteButton = document.getElementById('deleteBtn');
    const evaluateButton = document.getElementById('evaluateBtn');
    const homeButton = document.getElementById('homeBtn');
    
    try {
        // Vérifier le rôle de l'utilisateur
        const response = await fetch('http://localhost/3Dsite%20version%201.3/check_session.php', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.loggedIn) {
            window.location.href = '/index.html';
            return;
        }
        
        userRole = data.role;
        
        // Afficher les boutons selon le rôle
        if (userRole === 'admin' || userRole === 'pilote') {
            createButton.style.display = 'block';
            editButton.style.display = 'block';
            deleteButton.style.display = 'block';
        }
        
        if (userRole === 'etudiant' || userRole === 'admin') {
            evaluateButton.style.display = 'block';
        }
        
        // Initialiser le dashboard
        initDashboard();
        
        // Ajouter les écouteurs d'événements
        searchButton.addEventListener('click', function() { searchCompanies(); });
        homeButton.addEventListener('click', function() { window.location.href = '/index.html'; });
        
        if (userRole === 'admin' || userRole === 'pilote') {
            createButton.addEventListener('click', function() { createCompany(); });
            editButton.addEventListener('click', function() { editCompany(); });
            deleteButton.addEventListener('click', function() { deleteCompany(); });
        }
        
        if (userRole === 'etudiant' || userRole === 'admin') {
            evaluateButton.addEventListener('click', function() { evaluateCompany(); });
        }
        
        // Écouteurs pour le dashboard
        searchBtn.addEventListener('click', searchDashboardCompanies);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchDashboardCompanies();
        });
        sortSelect.addEventListener('change', sortCompanies);
        refreshBtn.addEventListener('click', loadDashboardData);
        
    } catch (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        window.location.href = '/index.html';
    }
    
    // Fonction pour initialiser le dashboard
    function initDashboard() {
        loadDashboardData();
    }
    
    // Fonction pour rechercher des entreprises dans le dashboard
    function searchDashboardCompanies() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredCompanies = [...allCompanies];
        } else {
            filteredCompanies = allCompanies.filter(company => {
                return company.nom_entreprise.toLowerCase().includes(searchTerm) || 
                      (company.description && company.description.toLowerCase().includes(searchTerm)) ||
                      (company.email && company.email.toLowerCase().includes(searchTerm));
            });
        }
        
        currentPage = 1;
        displayFilteredCompanies(filteredCompanies);
    }
    
    // Fonction pour afficher les entreprises filtrées
    function displayFilteredCompanies(companies) {
        if (companies.length === 0) {
            companiesList.innerHTML = '<div class="loader">Aucune entreprise trouvée.</div>';
            pagination.innerHTML = '';
            return;
        }
        
        // Trier les entreprises
        sortCompanies();
        
        // Afficher les entreprises
        displayDashboardCompanies();
    }
    
    // Fonction pour charger les données du dashboard
    async function loadDashboardData() {
        try {
            companiesList.innerHTML = '<div class="loader">Chargement des entreprises...</div>';
            
            const response = await fetch('http://localhost/3Dsite%20version%201.3/get_entreprises.php', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des entreprises');
            }
            
            const data = await response.json();
            
            if (data.success) {
                allCompanies = data.entreprises;
                filteredCompanies = [...allCompanies];
                
                // Trier et afficher les entreprises
                sortCompanies();
            } else {
                companiesList.innerHTML = `<div class="error">${data.message || 'Erreur lors du chargement des entreprises'}</div>`;
            }
        } catch (error) {
            console.error('Erreur:', error);
            companiesList.innerHTML = `<div class="error">Erreur: ${error.message}</div>`;
        }
    }
    
    // Fonction pour trier les entreprises
    function sortCompanies() {
        sortOption = sortSelect.value;
        
        switch (sortOption) {
            case 'alphabetical':
                filteredCompanies.sort((a, b) => a.nom_entreprise.localeCompare(b.nom_entreprise));
                break;
            case 'email':
                filteredCompanies.sort((a, b) => {
                    if (!a.email) return 1;
                    if (!b.email) return -1;
                    return a.email.localeCompare(b.email);
                });
                break;
            case 'rating':
                filteredCompanies.sort((a, b) => {
                    const ratingA = a.moyenne_evaluation ? parseFloat(a.moyenne_evaluation) : 0;
                    const ratingB = b.moyenne_evaluation ? parseFloat(b.moyenne_evaluation) : 0;
                    return ratingB - ratingA; // Tri décroissant par note
                });
                break;
        }
        
        displayDashboardCompanies();
    }
    
    // Fonction pour afficher les entreprises dans le dashboard
    function displayDashboardCompanies() {
        // Calculer les indices pour la pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const companiesToShow = filteredCompanies.slice(startIndex, endIndex);
        
        // Vider la liste
        companiesList.innerHTML = '';
        
        // Ajouter chaque entreprise
        companiesToShow.forEach(company => {
            const companyElement = createCompanyElement(company);
            companiesList.appendChild(companyElement);
        });
        
        // Mettre à jour la pagination
        updatePagination();
    }
    
    // Fonction pour mettre à jour la pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
        pagination.innerHTML = '';
        
        // Si pas de pages, ne pas afficher la pagination
        if (totalPages <= 1) {
            return;
        }

        // Bouton précédent
        const prevBtn = document.createElement('button');
        prevBtn.classList.add('pagination-btn');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayDashboardCompanies();
            }
        });
        pagination.appendChild(prevBtn);
        
        // Pages
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('pagination-btn');
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                displayDashboardCompanies();
            });
            pagination.appendChild(pageBtn);
        }
        
        // Bouton suivant
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('pagination-btn');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayDashboardCompanies();
            }
        });
        pagination.appendChild(nextBtn);
    }
    
    // Fonction pour créer un élément d'entreprise
    function createCompanyElement(company) {
        const element = document.createElement('div');
        element.classList.add('offer-item', 'company-item');
        
        // Formatage de la note moyenne
        const rating = company.moyenne_evaluation 
            ? parseFloat(company.moyenne_evaluation).toFixed(1) 
            : 'Non évalué';
        
        const ratingStars = company.moyenne_evaluation 
            ? generateStarRating(parseFloat(company.moyenne_evaluation)) 
            : '';
        
        // Actions disponibles selon le rôle utilisateur
        let actionsHtml = '';
        if (userRole === 'admin' || userRole === 'pilote') {
            actionsHtml = `
                <div class="offer-actions">
                    <button class="offer-action-btn edit" onclick="quickEditCompany(${company.Id_Entreprise})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="offer-action-btn delete" onclick="quickDeleteCompany(${company.Id_Entreprise})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        } else if (userRole === 'etudiant') {
            actionsHtml = `
                <div class="offer-actions">
                    <button class="offer-action-btn" onclick="quickEvaluateCompany(${company.Id_Entreprise})">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            `;
        }
        
        element.innerHTML = `
            ${actionsHtml}
            <h3>${company.nom_entreprise}</h3>
            <p class="company-email"><i class="fas fa-envelope"></i> ${company.email || 'Non renseigné'}</p>
            <p class="company-phone"><i class="fas fa-phone"></i> ${company.telephone || 'Non renseigné'}</p>
            <p class="company-description"><i class="fas fa-info-circle"></i> ${
                company.description 
                    ? (company.description.length > 100 
                        ? company.description.substring(0, 100) + '...' 
                        : company.description)
                    : 'Aucune description'
            }</p>
            <p class="company-rating">
                <i class="fas fa-star"></i> Note: ${rating} ${ratingStars}
            </p>
        `;
        
        // Ajouter un écouteur pour afficher les détails
        element.addEventListener('click', function(e) {
            // Éviter de déclencher si on a cliqué sur un bouton d'action
            if (!e.target.closest('.offer-actions')) {
                showCompanyDetails(company.Id_Entreprise);
            }
        });
        
        return element;
    }
    
    // Fonction pour générer l'affichage des étoiles
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHtml = '';
        
        // Étoiles pleines
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star" style="color: gold;"></i>';
        }
        
        // Demi-étoile si nécessaire
        if (halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt" style="color: gold;"></i>';
        }
        
        // Étoiles vides
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star" style="color: gold;"></i>';
        }
        
        return starsHtml;
    }
    
    // Fonction pour afficher les détails d'une entreprise
    function showCompanyDetails(companyId) {
        const company = allCompanies.find(c => c.Id_Entreprise === companyId);
        
        if (!company) {
            return;
        }

        // Créer une fenêtre modale pour afficher les détails
        const modal = document.createElement('div');
        modal.classList.add('modal');
        
        // Formatage de la note moyenne
        const rating = company.moyenne_evaluation 
            ? parseFloat(company.moyenne_evaluation).toFixed(1) 
            : 'Non évalué';
        
        const ratingStars = company.moyenne_evaluation 
            ? generateStarRating(parseFloat(company.moyenne_evaluation)) 
            : 'Aucune évaluation';
        
        // Boutons d'action selon le rôle
        let actionButtons = '';
        if (userRole === 'admin' || userRole === 'pilote') {
            actionButtons = `
                <button class="action-btn edit" onclick="quickEditCompany(${company.Id_Entreprise})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="action-btn delete" onclick="quickDeleteCompany(${company.Id_Entreprise})">
                    <i class="fas fa-trash-alt"></i> Supprimer
                </button>
            `;
        }
        if (userRole === 'etudiant' || userRole === 'admin') {
            actionButtons += `
                <button class="action-btn" onclick="quickEvaluateCompany(${company.Id_Entreprise})">
                    <i class="fas fa-star"></i> Évaluer
                </button>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="company-details">
                    <div class="detail-header">
                        <h3>${company.nom_entreprise}</h3>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Informations générales</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">Email</div>
                                <div class="detail-value">${company.email || 'Non renseigné'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Téléphone</div>
                                <div class="detail-value">${company.telephone || 'Non renseigné'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Évaluation</div>
                                <div class="detail-value">${rating} ${ratingStars}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Description</h4>
                        <p>${company.description || 'Aucune description disponible'}</p>
                    </div>
                    
                    <div class="detail-actions">
                        ${actionButtons}
                        <button class="action-btn" onclick="viewCompanyOffers(${company.Id_Entreprise})">
                            <i class="fas fa-list"></i> Voir les offres
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la fermeture de la modale
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Fermer la modale si on clique en dehors
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Fermer la modale avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour rechercher une entreprise
    function searchCompanies() {
        const searchForm = document.createElement('div');
        searchForm.classList.add('modal-form');
        
        searchForm.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Rechercher une entreprise</h2>
                <form id="search-company-form">
                    <div class="form-group">
                        <label for="search-term">Terme de recherche</label>
                        <input type="text" id="search-term" name="search-term" placeholder="Nom, email ou description..." required>
                    </div>
                    <button type="submit" class="action-btn">Rechercher</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(searchForm);
        
        // Gérer la fermeture de la modale
        const closeBtn = searchForm.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            searchForm.remove();
        });
        
        // Fermer la modale si on clique en dehors
        searchForm.addEventListener('click', function(e) {
            if (e.target === searchForm) {
                searchForm.remove();
            }
        });
        
        // Gérer la soumission du formulaire
        const form = searchForm.querySelector('#search-company-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchTerm = document.getElementById('search-term').value.toLowerCase().trim();
            searchInput.value = searchTerm;
            searchDashboardCompanies();
            
            searchForm.remove();
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                searchForm.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour créer une entreprise
    function createCompany() {
        const createForm = document.createElement('div');
        createForm.classList.add('modal-form');
        
        createForm.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Créer une entreprise</h2>
                <form id="create-company-form">
                    <div class="form-group">
                        <label for="company-name">Nom de l'entreprise *</label>
                        <input type="text" id="company-name" name="company-name" required>
                    </div>
                    <div class="form-group">
                        <label for="company-email">Email</label>
                        <input type="email" id="company-email" name="company-email">
                    </div>
                    <div class="form-group">
                        <label for="company-phone">Téléphone</label>
                        <input type="text" id="company-phone" name="company-phone">
                    </div>
                    <div class="form-group">
                        <label for="company-description">Description</label>
                        <textarea id="company-description" name="company-description" rows="4"></textarea>
                    </div>
                    <button type="submit" class="action-btn">Créer</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(createForm);
        
        // Gérer la fermeture de la modale
        const closeBtn = createForm.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            createForm.remove();
        });
        
        // Fermer la modale si on clique en dehors
        createForm.addEventListener('click', function(e) {
            if (e.target === createForm) {
                createForm.remove();
            }
        });
        
        // Gérer la soumission du formulaire
        const form = createForm.querySelector('#create-company-form');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const companyData = {
                nom_entreprise: document.getElementById('company-name').value,
                email: document.getElementById('company-email').value || null,
                telephone: document.getElementById('company-phone').value || null,
                description: document.getElementById('company-description').value || null
            };
            
            try {
                const response = await fetch('http://localhost/3Dsite%20version%201.3/manage_entreprise.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(companyData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage(data.message, 'success');
                    loadDashboardData(); // Recharger les données
                    createForm.remove();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage('Une erreur est survenue lors de la création de l\'entreprise', 'error');
            }
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                createForm.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour modifier une entreprise
    function editCompany() {
        if (filteredCompanies.length === 0) {
            showMessage('Aucune entreprise disponible à modifier', 'error');
            return;
        }
        
        const editForm = document.createElement('div');
        editForm.classList.add('modal-form');
        
        // Créer les options pour le select
        let optionsHtml = '';
        allCompanies.forEach(company => {
            optionsHtml += `<option value="${company.Id_Entreprise}">${company.nom_entreprise}</option>`;
        });
        
        editForm.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Modifier une entreprise</h2>
                <form id="edit-company-select-form">
                    <div class="form-group">
                        <label for="company-select">Sélectionner une entreprise</label>
                        <select id="company-select" name="company-select" required>
                            <option value="">-- Choisir une entreprise --</option>
                            ${optionsHtml}
                        </select>
                    </div>
                    <button type="submit" class="action-btn">Continuer</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(editForm);
        
        // Gérer la fermeture de la modale
        const closeBtn = editForm.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            editForm.remove();
        });
        
        // Fermer la modale si on clique en dehors
        editForm.addEventListener('click', function(e) {
            if (e.target === editForm) {
                editForm.remove();
            }
        });
        
        // Gérer la soumission du formulaire de sélection
        const selectForm = editForm.querySelector('#edit-company-select-form');
        selectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const companyId = document.getElementById('company-select').value;
            if (!companyId) {
                showMessage('Veuillez sélectionner une entreprise', 'error');
                return;
            }
            
            editForm.remove();
            quickEditCompany(companyId);
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                editForm.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour modifier rapidement une entreprise (à partir de l'ID)
    function quickEditCompany(companyId) {
        const company = allCompanies.find(c => c.Id_Entreprise == companyId);
        
        if (!company) {
            showMessage('Entreprise non trouvée', 'error');
            return;
        }

        const editForm = document.createElement('div');
        editForm.classList.add('modal-form');
        
        editForm.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Modifier ${company.nom_entreprise}</h2>
                <form id="edit-company-form">
                    <div class="form-group">
                        <label for="edit-company-name">Nom de l'entreprise *</label>
                        <input type="text" id="edit-company-name" name="edit-company-name" value="${company.nom_entreprise}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-company-email">Email</label>
                        <input type="email" id="edit-company-email" name="edit-company-email" value="${company.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-company-phone">Téléphone</label>
                        <input type="text" id="edit-company-phone" name="edit-company-phone" value="${company.telephone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-company-description">Description</label>
                        <textarea id="edit-company-description" name="edit-company-description" rows="4">${company.description || ''}</textarea>
                    </div>
                    <button type="submit" class="action-btn">Enregistrer</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(editForm);
        
        // Gérer la fermeture de la modale
        const closeBtn = editForm.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            editForm.remove();
        });
        
        // Fermer la modale si on clique en dehors
        editForm.addEventListener('click', function(e) {
            if (e.target === editForm) {
                editForm.remove();
            }
        });
        
        // Gérer la soumission du formulaire
        const form = editForm.querySelector('#edit-company-form');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const companyData = {
                nom_entreprise: document.getElementById('edit-company-name').value,
                email: document.getElementById('edit-company-email').value || null,
                telephone: document.getElementById('edit-company-phone').value || null,
                description: document.getElementById('edit-company-description').value || null
            };
            
            try {
                const response = await fetch(`http://localhost/3Dsite%20version%201.3/manage_entreprise.php?id=${companyId}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(companyData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage(data.message, 'success');
                    loadDashboardData(); // Recharger les données
                    editForm.remove();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage('Une erreur est survenue lors de la modification de l\'entreprise', 'error');
            }
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                editForm.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour supprimer une entreprise
    function deleteCompany() {
        if (filteredCompanies.length === 0) {
            showMessage('Aucune entreprise disponible à supprimer', 'error');
            return;
        }

        const deleteForm = document.createElement('div');
        deleteForm.classList.add('modal-form');
        
        // Créer les options pour le select
        let optionsHtml = '';
        allCompanies.forEach(company => {
            optionsHtml += `<option value="${company.Id_Entreprise}">${company.nom_entreprise}</option>`;
        });
        
        deleteForm.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Supprimer une entreprise</h2>
                <form id="delete-company-select-form">
                    <div class="form-group">
                        <label for="company-select">Sélectionner une entreprise</label>
                        <select id="company-select" name="company-select" required>
                            <option value="">-- Choisir une entreprise --</option>
                            ${optionsHtml}
                        </select>
                    </div>
                    <button type="submit" class="action-btn">Continuer</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(deleteForm);
        
        // Gérer la fermeture de la modale
        const closeBtn = deleteForm.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            deleteForm.remove();
        });
        
        // Fermer la modale si on clique en dehors
        deleteForm.addEventListener('click', function(e) {
            if (e.target === deleteForm) {
                deleteForm.remove();
            }
        });
        
        // Gérer la soumission du formulaire de sélection
        const selectForm = deleteForm.querySelector('#delete-company-select-form');
        selectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const companyId = document.getElementById('company-select').value;
            if (!companyId) {
                showMessage('Veuillez sélectionner une entreprise', 'error');
                return;
            }
            
            deleteForm.remove();
            quickDeleteCompany(companyId);
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                deleteForm.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour supprimer rapidement une entreprise (à partir de l'ID)
    function quickDeleteCompany(companyId) {
        const company = allCompanies.find(c => c.Id_Entreprise == companyId);
        
        if (!company) {
            showMessage('Entreprise non trouvée', 'error');
            return;
        }
        
        const confirmDelete = document.createElement('div');
        confirmDelete.classList.add('modal-form');
        
        confirmDelete.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Confirmation de suppression</h2>
                <p>Êtes-vous sûr de vouloir supprimer l'entreprise "${company.nom_entreprise}" ?</p>
                <p class="warning">Attention : Cette action est irréversible et supprimera également toutes les offres liées à cette entreprise.</p>
                <div class="form-actions">
                    <button id="cancel-delete" class="action-btn cancel">Annuler</button>
                    <button id="confirm-delete" class="action-btn delete">Supprimer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDelete);
        
        // Gérer la fermeture de la modale
        const closeBtn = confirmDelete.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            confirmDelete.remove();
        });
        
        // Fermer la modale si on clique en dehors
        confirmDelete.addEventListener('click', function(e) {
            if (e.target === confirmDelete) {
                confirmDelete.remove();
            }
        });
        
        // Gérer l'annulation
        const cancelBtn = confirmDelete.querySelector('#cancel-delete');
        cancelBtn.addEventListener('click', () => {
            confirmDelete.remove();
        });
        
        // Gérer la confirmation
        const deleteBtn = confirmDelete.querySelector('#confirm-delete');
        deleteBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`http://localhost/3Dsite%20version%201.3/manage_entreprise.php?id=${companyId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

            const data = await response.json();
                
                if (data.success) {
                    showMessage(data.message, 'success');
                    loadDashboardData(); // Recharger les données
                    confirmDelete.remove();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage('Une erreur est survenue lors de la suppression de l\'entreprise', 'error');
            }
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                confirmDelete.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour évaluer une entreprise
    function evaluateCompany() {
        if (filteredCompanies.length === 0) {
            showMessage('Aucune entreprise disponible à évaluer', 'error');
            return;
        }
        
        const evaluateForm = document.createElement('div');
        evaluateForm.classList.add('modal-form');
        
        // Créer les options pour le select
        let optionsHtml = '';
        allCompanies.forEach(company => {
            optionsHtml += `<option value="${company.Id_Entreprise}">${company.nom_entreprise}</option>`;
        });
        
        evaluateForm.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Évaluer une entreprise</h2>
                <form id="evaluate-company-select-form">
                    <div class="form-group">
                        <label for="company-select">Sélectionner une entreprise</label>
                        <select id="company-select" name="company-select" required>
                            <option value="">-- Choisir une entreprise --</option>
                            ${optionsHtml}
                        </select>
                    </div>
                    <button type="submit" class="action-btn">Continuer</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(evaluateForm);
        
        // Gérer la fermeture de la modale
        const closeBtn = evaluateForm.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            evaluateForm.remove();
        });
        
        // Fermer la modale si on clique en dehors
        evaluateForm.addEventListener('click', function(e) {
            if (e.target === evaluateForm) {
                evaluateForm.remove();
            }
        });
        
        // Gérer la soumission du formulaire de sélection
        const selectForm = evaluateForm.querySelector('#evaluate-company-select-form');
        selectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const companyId = document.getElementById('company-select').value;
            if (!companyId) {
                showMessage('Veuillez sélectionner une entreprise', 'error');
                return;
            }

            evaluateForm.remove();
            quickEvaluateCompany(companyId);
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                evaluateForm.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour évaluer rapidement une entreprise (à partir de l'ID)
    function quickEvaluateCompany(companyId) {
        const company = allCompanies.find(c => c.Id_Entreprise == companyId);
        
        if (!company) {
            showMessage('Entreprise non trouvée', 'error');
            return;
        }
        
        const evaluateForm = document.createElement('div');
        evaluateForm.classList.add('modal-form');
        
        evaluateForm.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Évaluer ${company.nom_entreprise}</h2>
                <form id="evaluate-company-form">
                    <div class="form-group">
                        <label for="company-rating">Note (de 0 à 5)</label>
                        <div class="rating-container">
                            <input type="range" id="company-rating" name="company-rating" min="0" max="5" step="0.5" value="3">
                            <div class="rating-value">3</div>
                        </div>
                        <div class="rating-stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="far fa-star"></i>
                            <i class="far fa-star"></i>
                        </div>
                    </div>
                    <button type="submit" class="action-btn">Enregistrer</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(evaluateForm);
        
        // Gérer la fermeture de la modale
        const closeBtn = evaluateForm.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            evaluateForm.remove();
        });
        
        // Fermer la modale si on clique en dehors
        evaluateForm.addEventListener('click', function(e) {
            if (e.target === evaluateForm) {
                evaluateForm.remove();
            }
        });
        
        // Mettre à jour l'affichage des étoiles et de la valeur
        const ratingInput = document.getElementById('company-rating');
        const ratingValue = evaluateForm.querySelector('.rating-value');
        const ratingStars = evaluateForm.querySelector('.rating-stars');
        
        ratingInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            ratingValue.textContent = value.toFixed(1);
            
            // Mettre à jour les étoiles
            updateStars(value);
        });
        
        function updateStars(value) {
            const stars = ratingStars.querySelectorAll('i');
            
            stars.forEach((star, index) => {
                if (index < Math.floor(value)) {
                    star.className = 'fas fa-star';
                } else if (index === Math.floor(value) && value % 1 >= 0.5) {
                    star.className = 'fas fa-star-half-alt';
                } else {
                    star.className = 'far fa-star';
                }
            });
        }
        
        // Gérer la soumission du formulaire
        const form = evaluateForm.querySelector('#evaluate-company-form');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const ratingData = {
                id_entreprise: companyId,
                note: parseFloat(document.getElementById('company-rating').value)
            };
            
            try {
                const response = await fetch('http://localhost/3Dsite%20version%201.3/evaluate_company.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ratingData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage(data.message, 'success');
                    loadDashboardData(); // Recharger les données
                    evaluateForm.remove();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage('Une erreur est survenue lors de l\'évaluation de l\'entreprise', 'error');
            }
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                evaluateForm.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    // Fonction pour voir les offres d'une entreprise
    function viewCompanyOffers(companyId) {
        // Rediriger vers la page des offres avec un filtre pour cette entreprise
        window.location.href = `/Gestion_offres.html?company=${companyId}`;
    }
    
    // Fonction pour afficher un message
    function showMessage(message, type = 'success') {
        // Supprimer tout message existant
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Créer un nouvel élément de message
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = message;
        
        // Ajouter le message au DOM
        document.body.appendChild(messageElement);
        
        // Supprimer le message après un délai
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // Ajouter les fonctions au contexte global pour les rendre accessibles depuis le HTML
    window.quickEditCompany = quickEditCompany;
    window.quickDeleteCompany = quickDeleteCompany;
    window.quickEvaluateCompany = quickEvaluateCompany;
    window.viewCompanyOffers = viewCompanyOffers;
});
