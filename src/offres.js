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

// Remplacement de THREE.Geometry par THREE.BufferGeometry
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

document.addEventListener("DOMContentLoaded", () => {
    checkAuthAndPermissions();
    const container = document.querySelector(".container");
    const body = document.body;
    const evaluerBtn = document.getElementById("evaluerBtn");
    const statsBtn = document.getElementById("statsBtn");
    
    // Initialize offers array
    let offers = [];
    window.offers = offers;

    // Initialize user's wishlist
    let userWishlist = [];
    window.userWishlist = userWishlist;

    // Charger les offres depuis la base de données
    async function loadOffres() {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=offres', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Erreur lors du chargement des offres');
            const data = await response.json();
            offers = data.offres;
            userWishlist = data.wishlist || [];
            window.offers = offers;
            window.userWishlist = userWishlist;
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement des offres');
        }
    }

    // Charger les compétences depuis la base de données
    async function loadCompetences() {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=competences', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Erreur lors du chargement des compétences');
            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement des compétences');
            return [];
        }
    }

    // Charger les entreprises depuis la base de données
    async function loadEntreprises() {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=entreprises', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Erreur lors du chargement des entreprises');
            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement des entreprises');
            return [];
        }
    }

    // Charger les données au démarrage
    loadOffres();

    // Add debounce function to prevent multiple rapid clicks
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function moveContainerLeft() {
        container.style.transition = "transform 0.5s ease-in-out";
        container.style.transform = "translate(-200%, -50%)";
        clearForms();
    }

    function resetContainerPosition() {
        container.style.transition = "transform 0.5s ease-in-out";
        container.style.transform = "translate(-50%, -50%)";
        clearForms();
        if(evaluerBtn) evaluerBtn.style.display = "none";
        if(statsBtn) statsBtn.style.display = "none";
    }

    function clearForms() {
        document.querySelectorAll(".form-container").forEach(form => form.remove());
    }

    function createForm(title, content, callback) {
        moveContainerLeft();
        setTimeout(() => {
            const formDiv = document.createElement("div");
            formDiv.classList.add("form-container");
            formDiv.innerHTML = `<h2>${title}</h2>${content}<button class="back-btn">Retour</button>`;
            body.appendChild(formDiv);

            // Ajouter les styles pour les formulaires
            const style = document.createElement('style');
            style.textContent = `
                .form-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(40, 40, 40, 0.95);
                    padding: 3rem;
                    border-radius: 15px;
                    box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
                    width: 90%;
                    max-width: 1200px;
                    height: 90vh;
                    overflow-y: auto;
                    z-index: 1000;
                }

                .form-container h2 {
                    font-size: 24px;
                    margin-bottom: 30px;
                    color: #fff;
                    text-align: center;
                }

                .form-container .form-input,
                .form-container .form-textarea,
                .form-container .form-select {
                    width: 100%;
                    padding: 12px 15px;
                    margin-bottom: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 16px;
                }

                .form-container .form-textarea {
                    min-height: 150px;
                    resize: vertical;
                }

                .form-container .form-select {
                    height: auto;
                }

                .form-container .form-select[multiple] {
                    height: 200px;
                }

                .form-left {
                    flex: 1;
                    padding: 20px;
                }

                .form-right {
                    flex: 1;
                    padding: 30px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    margin-left: 20px;
                }

                .competences-section {
                    margin-top: 20px;
                }

                .competences-section h3 {
                    font-size: 18px;
                    margin-bottom: 15px;
                    color: #fff;
                }

                .competences-select {
                    height: 250px !important;
                    margin-bottom: 20px;
                }

                .new-competence {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }

                .new-competence input {
                    flex: 1;
                }

                .add-btn {
                    padding: 12px 25px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.3s;
                }

                .add-btn:hover {
                    background: #45a049;
                }

                .submit-btn {
                    width: 100%;
                    padding: 15px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: background 0.3s;
                    margin-top: 20px;
                }

                .submit-btn:hover {
                    background: #0056b3;
                }

                .back-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background: #666;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.3s;
                }

                .back-btn:hover {
                    background: #888;
                }

                /* Style pour le formulaire de création/modification */
                .create-form {
                    display: flex;
                    gap: 30px;
                    margin-top: 20px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #fff;
                    font-size: 16px;
                }

                /* Style pour les dates */
                .date-group {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .date-group > div {
                    flex: 1;
                }

                /* Style pour le message d'aide */
                .help-text {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 14px;
                    margin-top: 5px;
                }
            `;
            document.head.appendChild(style);

            document.querySelector(".back-btn").addEventListener("click", debounce(resetContainerPosition, 300));
            
            if (callback && typeof callback === 'function') {
                callback(formDiv);
            }
        }, 500);
    }

    // Search offers
    window.searchOffers = debounce(function() {
        createForm("Rechercher une offre", `
            <input type="text" id="searchInput" placeholder="Titre de l'offre..." class="search-input" />
            <button id="searchBtn" class="search-btn">Chercher</button>
            <div id="searchResults" class="search-results"></div>
        `, function(formDiv) {
            const searchBtn = formDiv.querySelector("#searchBtn");
            if (searchBtn) {
                searchBtn.addEventListener("click", debounce(performOfferSearch, 300));
            }
        });
    }, 510);

    window.performOfferSearch = debounce(async function() {
        const searchValue = document.getElementById("searchInput").value.trim().toLowerCase();
        const resultDiv = document.getElementById("searchResults");
        resultDiv.innerHTML = "";

        if (!searchValue) {
            alert("Veuillez entrer un titre d'offre.");
            resultDiv.innerHTML = "<p>Veuillez entrer un titre d'offre.</p>";
            return;
        }

        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=offres', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des offres');
            }
            
            const data = await response.json();
            const foundOffers = data.offres.filter(offer => 
                offer.titre_offre.toLowerCase().includes(searchValue) ||
                offer.nom_entreprise.toLowerCase().includes(searchValue) ||
                (offer.competences_noms && offer.competences_noms.toLowerCase().includes(searchValue))
        );

        if (foundOffers.length > 0) {
                const itemsPerPage = 5;
                const totalPages = Math.ceil(foundOffers.length / itemsPerPage);
                let currentPage = 1;

                function displayPage(page) {
                    const start = (page - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    const pageOffers = foundOffers.slice(start, end);

                    resultDiv.innerHTML = "";
                    
                    pageOffers.forEach(offer => {
                        const isInWishlist = data.wishlist.includes(offer.Id_Offre);
                        const hasApplied = offer.has_applied == 1;
                        
                        // Create offer element
                        const offerElement = document.createElement('div');
                        offerElement.className = 'offer-result';
                        
                        // Format dates for display
                        const startDate = new Date(offer.date_debut).toLocaleDateString();
                        const endDate = new Date(offer.date_fin).toLocaleDateString();
                        
                        // Create offer content
                        offerElement.innerHTML = `
                            <h3>${offer.titre_offre}</h3>
                            <p><strong>Entreprise:</strong> ${offer.nom_entreprise}</p>
                            <p><strong>Description:</strong> ${offer.description_offre}</p>
                            <p><strong>Compétences:</strong> ${offer.competences_noms || 'Aucune compétence spécifiée'}</p>
                            <p><strong>Salaire:</strong> ${offer.remuneration}€</p>
                            <p><strong>Date de début:</strong> ${startDate}</p>
                            <p><strong>Date de fin:</strong> ${endDate}</p>
                            <p><strong>Nombre de candidatures:</strong> ${offer.nombre_candidatures || 0}</p>
                            <div class="offer-actions">
                                <button class="wishlist-btn" data-offer-id="${offer.Id_Offre}" onclick="${!isInWishlist ? 'addToWishlist' : 'removeFromWishlist'}(${offer.Id_Offre})">
                                    ${!isInWishlist ? '<i class="fas fa-heart"></i> Ajouter à la wishlist' : '<i class="fas fa-heart-broken"></i> Retirer de la wishlist'}
                                </button>
                                <button class="apply-btn" onclick="applyForOffer(${offer.Id_Offre})" ${hasApplied ? 'disabled' : ''}>
                                    ${hasApplied ? '<i class="fas fa-check"></i> Déjà postulé' : '<i class="fas fa-paper-plane"></i> Postuler'}
                                </button>
                            </div>
                        `;
                        
                        resultDiv.appendChild(offerElement);
                    });

                    // Add pagination if multiple pages exist
                    if (totalPages > 1) {
                        const pagination = document.createElement('div');
                        pagination.className = 'search-pagination';
                        pagination.style.display = 'flex';
                        pagination.style.justifyContent = 'center';
                        pagination.style.gap = '10px';
                        pagination.style.marginTop = '20px';

                        for (let i = 1; i <= totalPages; i++) {
                            const pageBtn = document.createElement('button');
                            pageBtn.textContent = i;
                            pageBtn.className = i === currentPage ? 'pagination-btn active' : 'pagination-btn';
                            pageBtn.addEventListener('click', () => {
                                currentPage = i;
                                displayPage(i);
                            });
                            pagination.appendChild(pageBtn);
                        }

                        resultDiv.appendChild(pagination);
                    }
                }
                
                // Display first page initially
                displayPage(1);
                
                // Set up global changePage function for pagination
                window.changePage = function(pageNum) {
                    if (pageNum >= 1 && pageNum <= totalPages) {
                        currentPage = pageNum;
                        displayPage(currentPage);
                    }
                };

            if(evaluerBtn) evaluerBtn.style.display = "block";
            if(statsBtn) statsBtn.style.display = "block";
        } else {
            alert("Aucune offre trouvée.");
            resultDiv.innerHTML = "<p>Aucune offre trouvée.</p>";
            if(evaluerBtn) evaluerBtn.style.display = "none";
            if(statsBtn) statsBtn.style.display = "none";
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            resultDiv.innerHTML = "<p>Erreur lors de la recherche des offres. Veuillez réessayer.</p>";
        }
    }, 300);

    // Create offer
    window.createOffer = debounce(async function() {
        try {
            const competences = await loadCompetences();
            const entreprises = await loadEntreprises();
            
            if (!competences || competences.length === 0) {
                alert("Impossible de charger les compétences. Veuillez réessayer.");
                return;
            }
            
            const competencesOptions = competences.map(c => 
                `<option value="${c.Id_competences}">${c.nom_competences}</option>`
            ).join('');
            
            const entreprisesOptions = entreprises.map(e => 
                `<option value="${e.Id_Entreprise}">${e.nom_entreprise}</option>`
            ).join('');

        createForm("Créer une offre", `
                <div class="create-form">
                    <div class="form-left">
                        <div class="form-group">
                            <label for="offerTitle">Titre de l'offre</label>
                            <input type="text" id="offerTitle" required class="form-input" />
                        </div>
                        
                        <div class="form-group">
                            <label for="offerCompany">Entreprise</label>
                            <select id="offerCompany" required class="form-input">
                                <option value="">Sélectionner une entreprise</option>
                                ${entreprisesOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="offerDescription">Description détaillée</label>
                            <textarea id="offerDescription" required class="form-textarea" rows="6"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="offerSalary">Salaire (€)</label>
                            <input type="number" id="offerSalary" required class="form-input" />
                        </div>
                        
                        <div class="date-group">
                            <div>
                                <label for="offerStartDate">Date de début</label>
            <input type="date" id="offerStartDate" required class="form-input" />
                            </div>
                            <div>
                                <label for="offerEndDate">Date de fin</label>
            <input type="date" id="offerEndDate" required class="form-input" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-right">
                        <div class="competences-section">
                            <h3>Compétences requises</h3>
                            <p class="help-text">Maintenez Ctrl pour sélectionner plusieurs compétences</p>
                            <select id="offerSkills" multiple required class="competences-select">
                                ${competencesOptions}
                            </select>
                            
                            <div class="new-competence">
                                <input type="text" id="newCompetence" placeholder="Nouvelle compétence" class="form-input" />
                                <button id="addCompetenceBtn" class="add-btn">Ajouter</button>
                            </div>
                        </div>
                    </div>
                </div>
            <button id="saveOfferBtn" class="submit-btn">Créer l'offre</button>
            `, function(formDiv) {
                // Gérer l'ajout d'une nouvelle compétence
                document.getElementById("addCompetenceBtn").addEventListener("click", async function() {
                    const newCompetenceInput = document.getElementById("newCompetence");
                    const newCompetence = newCompetenceInput.value.trim();
                    
                    if (!newCompetence) {
                        alert("Veuillez entrer un nom de compétence");
                        return;
                    }

                    try {
                        const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                action: 'createCompetence',
                                nom: newCompetence
                            })
                        });

                        if (!response.ok) throw new Error('Erreur lors de la création de la compétence');
                        
                        const result = await response.json();
                        if (result.success) {
                            // Recharger les compétences
                            const competences = await loadCompetences();
                            const competencesOptions = competences.map(c => 
                                `<option value="${c.Id_competences}">${c.nom_competences}</option>`
                            ).join('');
                            
                            // Mettre à jour le select
                            const skillsSelect = document.getElementById("offerSkills");
                            skillsSelect.innerHTML = competencesOptions;
                            
                            // Vider l'input
                            newCompetenceInput.value = '';
                            
                            alert("Compétence ajoutée avec succès !");
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                        alert('Erreur lors de la création de la compétence');
                    }
                });

            document.getElementById("saveOfferBtn").addEventListener("click", debounce(saveOffer, 300));
        });
        } catch (error) {
            console.error('Erreur lors de la création du formulaire:', error);
            alert('Erreur lors de la création du formulaire');
        }
    }, 300);

    window.saveOffer = debounce(async function() {
        const title = document.getElementById("offerTitle").value.trim();
        const companyId = document.getElementById("offerCompany").value;
        const description = document.getElementById("offerDescription").value.trim();
        const skillsSelect = document.getElementById("offerSkills");
        const skills = Array.from(skillsSelect.selectedOptions).map(option => option.value);
        const salary = document.getElementById("offerSalary").value;
        const startDate = document.getElementById("offerStartDate").value;
        const endDate = document.getElementById("offerEndDate").value;

        // Log des valeurs pour déboguer
        console.log('Valeurs du formulaire:', {
            title,
            companyId,
            description,
            skills,
            salary,
            startDate,
            endDate
        });

        // Validation détaillée avec messages spécifiques
        if (!title) {
            alert("Veuillez entrer un titre d'offre.");
            return;
        }
        if (!companyId) {
            alert("Veuillez sélectionner une entreprise.");
            return;
        }
        if (!description) {
            alert("Veuillez entrer une description.");
            return;
        }
        if (skills.length === 0) {
            alert("Veuillez sélectionner au moins une compétence.");
            return;
        }
        if (!salary || isNaN(salary) || salary <= 0) {
            alert("Veuillez entrer un salaire valide.");
            return;
        }
        if (!startDate) {
            alert("Veuillez sélectionner une date de début.");
            return;
        }
        if (!endDate) {
            alert("Veuillez sélectionner une date de fin.");
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            alert("La date de fin doit être postérieure à la date de début.");
            return;
        }

        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    titre: title,
                    description: description,
                    remuneration: parseFloat(salary),
                    date_debut: startDate,
                    date_fin: endDate,
                    Id_Entreprise: parseInt(companyId),
                    competences: skills.map(s => parseInt(s))
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la création de l\'offre');
            }
            
            const result = await response.json();
            if (result.success) {
        alert("Offre créée avec succès !");
                loadOffres(); // Recharger les offres
        resetContainerPosition();
            } else {
                throw new Error('Erreur lors de la création de l\'offre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de la création de l\'offre');
        }
    }, 300);

    // Edit offer
    window.editOffer = debounce(async function() {
        if (offers.length === 0) {
            alert("Aucune offre disponible pour modification.");
            return;
        }

        const competences = await loadCompetences();
        const entreprises = await loadEntreprises();
        
        const competencesOptions = competences.map(c => 
            `<option value="${c.Id_competences}">${c.nom_competences}</option>`
        ).join('');
        
        const entreprisesOptions = entreprises.map(e => 
            `<option value="${e.Id_Entreprise}">${e.nom_entreprise}</option>`
        ).join('');

        const options = offers.map((offer, index) => 
            `<option value="${index}">${offer.titre_offre} - ${offer.nom_entreprise}</option>`
        ).join("");

        createForm("Modifier une offre", `
            <select id="offerSelect" class="form-select">${options}</select>
            <input type="text" id="editTitle" placeholder="Titre de l'offre" class="form-input" />
            <select id="editCompany" class="form-input">
                ${entreprisesOptions}
            </select>
            <textarea id="editDescription" placeholder="Description" class="form-textarea"></textarea>
            <select id="editSkills" multiple class="form-input">
                ${competencesOptions}
            </select>
            <input type="number" id="editSalary" placeholder="Salaire" class="form-input" />
            <input type="date" id="editStartDate" class="form-input" />
            <input type="date" id="editEndDate" class="form-input" />
            <button id="updateOfferBtn" class="submit-btn">Mettre à jour</button>
        `, function() {
            document.getElementById("offerSelect").addEventListener("change", function() {
                const offer = offers[this.value];
                document.getElementById("editTitle").value = offer.titre_offre;
                document.getElementById("editCompany").value = offer.Id_Entreprise;
                document.getElementById("editDescription").value = offer.description_offre;
                document.getElementById("editSkills").value = offer.competences.split(',').map(c => c.trim());
                document.getElementById("editSalary").value = offer.remuneration;
                document.getElementById("editStartDate").value = offer.date_debut;
                document.getElementById("editEndDate").value = offer.date_fin;
            });
            document.getElementById("updateOfferBtn").addEventListener("click", debounce(updateOffer, 300));
            document.getElementById("offerSelect").dispatchEvent(new Event("change"));
        });
    }, 300);

    window.updateOffer = debounce(async function() {
        const index = document.getElementById("offerSelect").value;
        const offer = offers[index];
        const title = document.getElementById("editTitle").value.trim();
        const companyId = document.getElementById("editCompany").value;
        const description = document.getElementById("editDescription").value.trim();
        const skills = Array.from(document.getElementById("editSkills").selectedOptions).map(option => option.value);
        const salary = parseFloat(document.getElementById("editSalary").value);
        const startDate = document.getElementById("editStartDate").value;
        const endDate = document.getElementById("editEndDate").value;

        if (!title || !companyId || !description || skills.length === 0 || !salary || !startDate || !endDate) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    Id_Offre: offer.Id_Offre,
                    titre: title,
                    description: description,
                    remuneration: salary,
                    date_debut: startDate,
                    date_fin: endDate,
                    Id_Entreprise: companyId,
                    competences: skills
                })
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'offre');
            
            const result = await response.json();
            if (result.success) {
        alert("Offre mise à jour avec succès !");
                loadOffres(); // Recharger les offres
        resetContainerPosition();
            } else {
                throw new Error('Erreur lors de la mise à jour de l\'offre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour de l\'offre');
        }
    }, 300);

    // Delete offer
    window.deleteOffer = debounce(function() {
        if (offers.length === 0) {
            alert("Aucune offre à supprimer.");
            return;
        }

        const options = offers.map((offer, index) => 
            `<option value="${index}">${offer.titre_offre} - ${offer.nom_entreprise}</option>`
        ).join("");

        createForm("Supprimer une offre", `
            <select id="deleteOfferSelect" class="form-select">${options}</select>
            <button id="confirmDeleteOfferBtn" class="delete-btn">Supprimer</button>
        `, function() {
            document.getElementById("confirmDeleteOfferBtn").addEventListener("click", debounce(confirmDeleteOffer, 300));
        });
    }, 300);

    window.confirmDeleteOffer = debounce(async function() {
        const index = document.getElementById("deleteOfferSelect").value;
        const offer = offers[index];

        try {
            const response = await fetch(`http://localhost/3Dsite%20version%201.3/offres_operations.php?id=${offer.Id_Offre}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            // Vérifier si la réponse est OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Vérifier si la réponse est vide
            const text = await response.text();
            if (!text) {
                throw new Error('La réponse est vide');
            }

            // Essayer de parser le JSON
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Erreur de parsing JSON:', text);
                throw new Error('Réponse invalide du serveur');
            }
            
            if (result.success) {
                // Recharger les offres d'abord
                await loadOffres();
                
                // Fermer le formulaire de suppression
                const formContainer = document.querySelector('.form-container');
                if (formContainer) {
                    formContainer.remove();
                }
                
                // Réinitialiser la position du conteneur
                resetContainerPosition();
                
                // Recréer le formulaire de suppression avec les nouvelles offres
                deleteOffer();
                
                // Afficher le message de succès
                alert("Offre supprimée avec succès !");
            } else {
                throw new Error(result.error || 'Erreur lors de la suppression de l\'offre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de la suppression de l\'offre');
        }
    }, 300);

    // View offer statistics
    window.showOfferStats = async function() {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=getStats', {
                credentials: 'include'
            });
            
            if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
            
            const stats = await response.json();

        createForm("Statistiques des offres", `
            <div class="stats-container">
                        <div class="stats-section">
                <h3>Répartition par compétence</h3>
                            <div class="stats-chart">
                                ${stats.competences.map(c => `
                                    <div class="chart-bar">
                                        <div class="bar-label">${c.nom_competences}</div>
                                        <div class="bar-container">
                                            <div class="bar" style="width: ${(c.count / Math.max(...stats.competences.map(c => c.count))) * 100}%"></div>
                                        </div>
                                        <div class="bar-value">${c.count}</div>
                                    </div>
                                `).join('')}
                            </div>
                </div>
                
                        <div class="stats-section">
                            <h3>Répartition par durée de stage</h3>
                            <div class="stats-chart">
                                ${stats.durees.map(d => `
                                    <div class="chart-bar">
                                        <div class="bar-label">${d.duree}</div>
                                        <div class="bar-container">
                                            <div class="bar" style="width: ${(d.count / Math.max(...stats.durees.map(d => d.count))) * 100}%"></div>
                                        </div>
                                        <div class="bar-value">${d.count}</div>
                                    </div>
                                `).join('')}
                            </div>
                </div>
                
                        <div class="stats-section">
                            <h3>Top 5 des offres en wishlist</h3>
                            <div class="wishlist-top">
                                ${stats.wishlist.map((w, index) => `
                                    <div class="wishlist-item">
                                        <span class="rank">#${index + 1}</span>
                                        <span class="title">${w.titre_offre}</span>
                                        <span class="count">${w.wishlist_count} wishlist</span>
                </div>
                                `).join('')}
            </div>
                        </div>
                    </div>
                </div>
            `, function(formDiv) {
                // Ajouter les styles spécifiques pour les statistiques
                const style = document.createElement('style');
                style.textContent = `
                    .stats-container {
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                        padding: 1rem;
                    }

                    .stats-section {
                        background: rgba(255, 255, 255, 0.05);
                        padding: 1.5rem;
                        border-radius: 10px;
                    }

                    .stats-section h3 {
                        color: #fff;
                        margin-bottom: 1rem;
                        font-size: 1.2rem;
                    }

                    .stats-chart {
                        display: flex;
                        flex-direction: column;
                        gap: 0.8rem;
                    }

                    .chart-bar {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }

                    .bar-label {
                        min-width: 150px;
                        color: #fff;
                    }

                    .bar-container {
                        flex: 1;
                        height: 20px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                        overflow: hidden;
                    }

                    .bar {
                        height: 100%;
                        background: #4CAF50;
                        transition: width 0.3s ease;
                    }

                    .bar-value {
                        min-width: 40px;
                        color: #fff;
                        text-align: right;
                    }

                    .wishlist-top {
                        display: flex;
                        flex-direction: column;
                        gap: 0.8rem;
                    }

                    .wishlist-item {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding: 0.8rem;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 5px;
                    }

                    .rank {
                        font-weight: bold;
                        color: #4CAF50;
                    }

                    .title {
                        flex: 1;
                        color: #fff;
                    }

                    .count {
                        color: #fff;
                        background: rgba(76, 175, 80, 0.2);
                        padding: 0.3rem 0.8rem;
                        border-radius: 15px;
                    }
                `;
                document.head.appendChild(style);
            });
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des statistiques');
        }
    };

    function updateWishlistButton(offerId, isInWishlist) {
        const button = document.querySelector(`button[data-offer-id="${offerId}"]`);
        if (button) {
            button.textContent = isInWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist';
            button.onclick = function() {
                if (isInWishlist) {
                    removeFromWishlist(offerId);
                } else {
                    addToWishlist(offerId);
                }
            };
        }
    }

    window.addToWishlist = async function(offerId) {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'addToWishlist',
                    Id_Offre: offerId
                })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'ajout à la wishlist');
            
            const result = await response.json();
            if (result.success) {
        if (!userWishlist.includes(offerId)) {
            userWishlist.push(offerId);
                }
                updateWishlistButton(offerId, true);
            } else {
                throw new Error(result.error || 'Erreur lors de l\'ajout à la wishlist');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de l\'ajout à la wishlist');
        }
    };

    window.removeFromWishlist = async function(offerId) {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'removeFromWishlist',
                    Id_Offre: offerId
                })
            });

            if (!response.ok) throw new Error('Erreur lors du retrait de la wishlist');
            
            const result = await response.json();
            if (result.success) {
        const index = userWishlist.indexOf(offerId);
        if (index > -1) {
            userWishlist.splice(index, 1);
                }
                updateWishlistButton(offerId, false);
            } else {
                throw new Error(result.error || 'Erreur lors du retrait de la wishlist');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors du retrait de la wishlist');
        }
    };

    // Apply for offer function
    window.applyForOffer = function(offerId) {
        const offer = offers.find(o => o.Id_Offre === offerId);
        if (!offer) return;

        // Si l'utilisateur a déjà postulé, afficher un message
        if (offer.has_applied == 1) {
            alert("Vous avez déjà postulé à cette offre.");
            return;
        }

        createForm("Postuler à l'offre", `
            <div class="application-form">
                <h3>${offer.titre_offre} - ${offer.nom_entreprise}</h3>
                <div class="form-group">
                    <label for="motivationLetter">Lettre de motivation</label>
                    <textarea id="motivationLetter" placeholder="Lettre de motivation" required class="form-textarea"></textarea>
                </div>
                <div class="form-group">
                    <label for="cvFile">CV (PDF uniquement)</label>
                    <input type="file" id="cvFile" accept=".pdf" required class="form-input-file">
                    <p class="file-help">Taille maximale: 5 MB</p>
                </div>
                <button id="submitApplication" class="submit-btn">Soumettre ma candidature</button>
            </div>
        `, function(formDiv) {
            document.getElementById("submitApplication").addEventListener("click", async function() {
                const motivationLetter = document.getElementById("motivationLetter").value.trim();
                const cvFile = document.getElementById("cvFile").files[0];

                // Validation des champs
                if (!motivationLetter) {
                    alert("Veuillez rédiger une lettre de motivation.");
                    return;
                }

                if (!cvFile) {
                    alert("Veuillez télécharger votre CV au format PDF.");
                    return;
                }

                // Vérifier que c'est bien un PDF
                if (cvFile.type !== 'application/pdf') {
                    alert("Seuls les fichiers PDF sont acceptés.");
                    return;
                }

                // Vérifier la taille du fichier (5MB max)
                const maxSize = 5 * 1024 * 1024;
                if (cvFile.size > maxSize) {
                    alert("Le fichier est trop volumineux. La taille maximale est de 5MB.");
                    return;
                }

                // Préparer les données pour l'envoi
                const formData = new FormData();
                formData.append('action', 'submitCandidature');
                formData.append('Id_Offre', offerId);
                formData.append('lettre_motivation', motivationLetter);
                formData.append('cv', cvFile);

                try {
                    // Afficher un message de chargement
                    const submitBtn = document.getElementById("submitApplication");
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Envoi en cours...";

                    const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Erreur lors de la soumission de la candidature');
                    }

                    const result = await response.json();
                    if (result.success) {
                        alert(result.message || "Votre candidature a été soumise avec succès !");
                        formDiv.remove(); // Fermer le formulaire
                        // Recharger les offres pour mettre à jour le nombre de candidatures
                        await loadOffres();
                        // Recharger l'affichage des offres
                        performOfferSearch();
                        resetContainerPosition();
                    } else {
                        throw new Error(result.error || 'Erreur lors de la soumission de la candidature');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert(error.message || 'Erreur lors de la soumission de la candidature');
                    
                    // Réactiver le bouton
                    const submitBtn = document.getElementById("submitApplication");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }
            });
        });
    };

    // Déplacer la fonction showMyApplications en dehors du bloc DOMContentLoaded
    window.showMyApplications = async function() {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=myApplications', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des candidatures');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Erreur lors de la récupération des candidatures');
            }

            // Utiliser createForm au lieu de créer un formulaire personnalisé
            createForm("Mes Candidatures",
                `<div class="applications-container">
                    ${data.applications.length === 0 ? 
                        '<div class="no-applications"><i class="fas fa-file-alt"></i><p>Vous n\'avez pas encore postulé à des offres.</p></div>' : 
                        data.applications.map(app => `
                            <div class="application-card">
                                <div class="application-header">
                                    <div class="application-title">
                                        <i class="fas fa-briefcase"></i>
                                        <h3>${app.titre_offre}</h3>
                                    </div>
                                    <div class="application-date">
                                        <i class="fas fa-calendar-alt"></i>
                                        <span>${new Date(app.date_candidature).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div class="application-details">
                                    <div class="company-info">
                                        <i class="fas fa-building"></i>
                                        <p><strong>Entreprise:</strong> ${app.nom_entreprise}</p>
                                    </div>
                                    <div class="cv-info">
                                        <i class="fas fa-file-pdf"></i>
                                        <p><strong>CV:</strong> 
                                            ${app.cv_path ? 
                                                `<a href="http://localhost/3Dsite%20version%201.3/${app.cv_path}" target="_blank" class="cv-link">Voir mon CV</a>` :
                                                'Non disponible'}
                                        </p>
                                    </div>
                                    <div class="motivation-letter">
                                        <h4><i class="fas fa-envelope"></i> Lettre de motivation</h4>
                                        <div class="letter-content">
                                            <p>${app.lettre_motivation}</p>
                                        </div>
                                    </div>
                                    <div class="application-actions">
                                        <button class="delete-application-btn" data-id="${app.Id_Candidature}" onclick="deleteApplication(${app.Id_Candidature})">
                                            <i class="fas fa-trash"></i> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                </div>`,
                function(formDiv) {
                    // Ajouter les styles spécifiques pour les applications
                    const style = document.createElement('style');
                    style.textContent = `
                        .applications-container {
                            max-height: 70vh;
                            overflow-y: auto;
                            padding: 20px;
                            display: grid;
                            gap: 20px;
                            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        }
                        .application-card {
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 15px;
                            padding: 25px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            transition: transform 0.3s ease, box-shadow 0.3s ease;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        }
                        .application-card:hover {
                            transform: translateY(-5px);
                            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
                        }
                        .application-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        }
                        .application-title {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        .application-title i {
                            font-size: 1.2em;
                            color: #4CAF50;
                        }
                        .application-title h3 {
                            margin: 0;
                            color: #fff;
                            font-size: 1.3em;
                        }
                        .application-date {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            color: rgba(255, 255, 255, 0.7);
                            font-size: 0.9em;
                        }
                        .application-date i {
                            color: #2196F3;
                        }
                        .application-details {
                            color: #fff;
                        }
                        .company-info, .cv-info {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            margin-bottom: 15px;
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 8px;
                        }
                        .company-info i {
                            color: #FF9800;
                        }
                        .cv-info i {
                            color: #F44336;
                        }
                        .company-info p, .cv-info p {
                            margin: 0;
                        }
                        .cv-link {
                            color: #4CAF50;
                            text-decoration: none;
                            font-weight: bold;
                            transition: color 0.3s ease;
                        }
                        .cv-link:hover {
                            color: #81C784;
                            text-decoration: underline;
                        }
                        .motivation-letter {
                            margin-top: 20px;
                        }
                        .motivation-letter h4 {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            margin: 0 0 15px 0;
                            color: #fff;
                            font-size: 1.1em;
                        }
                        .motivation-letter h4 i {
                            color: #E91E63;
                        }
                        .letter-content {
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 8px;
                            padding: 15px;
                            color: rgba(255, 255, 255, 0.9);
                            max-height: 150px;
                            overflow-y: auto;
                            margin-bottom: 15px;
                        }
                        .application-actions {
                            margin-top: 20px;
                            display: flex;
                            justify-content: flex-end;
                        }
                        .delete-application-btn {
                            background: rgba(244, 67, 54, 0.1);
                            color: #F44336;
                            border: 1px solid #F44336;
                            border-radius: 5px;
                            padding: 8px 15px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                        }
                        .delete-application-btn:hover {
                            background: rgba(244, 67, 54, 0.2);
                        }
                        .no-applications {
                            grid-column: 1 / -1;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            gap: 15px;
                            padding: 40px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 15px;
                            text-align: center;
                        }
                        .no-applications i {
                            font-size: 3em;
                            color: rgba(255, 255, 255, 0.3);
                        }
                        .file-help {
                            margin-top: 5px;
                            font-size: 0.8em;
                            color: rgba(255, 255, 255, 0.6);
                        }
                        .form-input-file {
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 5px;
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.05);
                            color: white;
                            width: 100%;
                        }
                    `;
                    document.head.appendChild(style);
                    
                    // Ajouter la fonction pour supprimer une candidature
                    window.deleteApplication = async function(candidatureId) {
                        if (!confirm("Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.")) {
                            return;
                        }
                        
                        try {
                            const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    action: 'deleteApplication',
                                    candidatureId: candidatureId
                                })
                            });
                            
                            if (!response.ok) {
                                throw new Error('Erreur lors de la suppression de la candidature');
                            }
                            
                            const result = await response.json();
                            
                            if (result.success) {
                                alert(result.message || "Candidature supprimée avec succès");
                                // Recharger les candidatures
                                showMyApplications();
                            } else {
                                throw new Error(result.message || 'Erreur lors de la suppression');
                            }
                        } catch (error) {
                            console.error('Erreur:', error);
                            alert(error.message);
                        }
                    };
                }
            );
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des candidatures');
        }
    };
});

// Vérification de l'authentification et des permissions
async function checkAuthAndPermissions() {
    try {
        const response = await fetch('http://localhost/3Dsite%20version%201.3/check_auth.php?page=offres', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/index.html';
            return;
        }

        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/index.html';
            return;
        }

        // Mettre à jour l'interface en fonction des permissions
        updateUIWithPermissions(data.permissions, data.role);
        
        // Mettre à jour le message de bienvenue
        const welcomeText = document.querySelector('.welcome-text');
        if (welcomeText && data.nom && data.prenom) {
            welcomeText.textContent = `Bienvenue ${data.prenom} ${data.nom} au`;
        }

    } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        window.location.href = '/index.html';
    }
}

// Fonction pour mettre à jour l'interface en fonction des permissions
function updateUIWithPermissions(permissions, role) {
    const createBtn = document.querySelector('[onclick="createOffer()"]');
    const editBtn = document.querySelector('[onclick="editOffer()"]');
    const deleteBtn = document.querySelector('[onclick="deleteOffer()"]');
    const searchBtn = document.querySelector('[onclick="searchOffers()"]');
    const evaluerBtn = document.getElementById('evaluerBtn');
    const statsBtn = document.getElementById('statsBtn');

    // Masquer tous les boutons par défaut
    if (createBtn) createBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (searchBtn) searchBtn.style.display = 'none';
    if (evaluerBtn) evaluerBtn.style.display = 'none';
    if (statsBtn) statsBtn.style.display = 'none';

    // Afficher uniquement les boutons pour lesquels l'utilisateur a les permissions
    if (createBtn && permissions.create.includes(role)) {
        createBtn.style.display = 'block';
    }
    if (editBtn && permissions.edit.includes(role)) {
        editBtn.style.display = 'block';
    }
    if (deleteBtn && permissions.delete.includes(role)) {
        deleteBtn.style.display = 'block';
    }
    if (searchBtn && permissions.search.includes(role)) {
        searchBtn.style.display = 'block';
    }
    if (evaluerBtn && permissions.search.includes(role)) {
        evaluerBtn.style.display = 'block';
    }
    if (statsBtn && permissions.search.includes(role)) {
        statsBtn.style.display = 'block';
    }
}

function displayOffers(offers) {
    const container = document.getElementById('results-container');
    if (!container) return;

    container.innerHTML = '';
    if (!offers || offers.length === 0) {
        container.innerHTML = '<p>Aucune offre trouvée</p>';
        return;
    }

    offers.forEach(offer => {
        const offerElement = document.createElement('div');
        offerElement.className = 'offer-item';
        
        const isInWishlist = userWishlist.includes(offer.Id_Offre);
        
        offerElement.innerHTML = `
            <h3>${offer.titre_offre}</h3>
            <p><strong>Entreprise:</strong> ${offer.nom_entreprise}</p>
            <p><strong>Description:</strong> ${offer.description_offre}</p>
            <p><strong>Rémunération:</strong> ${offer.remuneration}€</p>
            <p><strong>Période:</strong> Du ${formatDate(offer.date_debut)} au ${formatDate(offer.date_fin)}</p>
            <p><strong>Compétences requises:</strong> ${offer.competences_noms || 'Aucune compétence spécifiée'}</p>
            <div class="offer-buttons">
                <button onclick="showCandidatureForm(${offer.Id_Offre})" class="action-button">Postuler</button>
                <button class="wishlist-button" data-offer-id="${offer.Id_Offre}" onclick="${!isInWishlist ? 'addToWishlist' : 'removeFromWishlist'}(${offer.Id_Offre})">
                    ${!isInWishlist ? 'Ajouter à la wishlist' : 'Retirer de la wishlist'}
                </button>
            </div>
        `;
        
        container.appendChild(offerElement);
    });
}

function initializeOffres() {
    const container = document.querySelector('.container');
    if (!container) return;

    // Créer le conteneur des offres s'il n'existe pas
    let offresList = document.querySelector('.offres-list');
    if (!offresList) {
        offresList = document.createElement('div');
        offresList.className = 'offres-list';
        container.appendChild(offresList);
    }
    
    // Ajouter le bouton des statistiques
    const statsButton = document.createElement('button');
    statsButton.className = 'stats-button';
    statsButton.innerHTML = '<i class="fas fa-chart-bar"></i> Statistiques';
    statsButton.onclick = showStats;
    container.insertBefore(statsButton, offresList);
    
    // Charger les offres
    loadOffres();
}

function showStats() {
    // Cette fonction sera supprimée
}

function showMessage(message, type = 'success') {
    // Créer l'élément de message
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    // Ajouter le message au conteneur
    const container = document.querySelector('.container');
    container.insertBefore(messageElement, container.firstChild);

    // Supprimer le message après 3 secondes
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Ajouter cette fonction pour vérifier le rôle de l'utilisateur
async function checkUserRole() {
    try {
        const response = await fetch('http://localhost/3Dsite%20version%201.3/check_session.php', {
            credentials: 'include'
        });
        const data = await response.json();
        return data.role;
    } catch (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        return null;
    }
}

// Modifier la fonction createOfferCard
async function createOfferCard(offre) {
    const userRole = await checkUserRole();
    const isEntreprise = userRole === 'entreprise';
    const isEtudiant = userRole === 'etudiant';
    
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.dataset.id = offre.Id_Offre;
    
    // ... existing card content code ...
    
    // Modifier la section des boutons d'action
    const actionButtons = document.createElement('div');
    actionButtons.className = 'offer-actions';
    
    if (isEntreprise) {
        // Boutons pour les entreprises
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = 'Modifier';
        editButton.onclick = () => editOffre(offre.Id_Offre);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Supprimer';
        deleteButton.onclick = () => deleteOffre(offre.Id_Offre);
        
        actionButtons.appendChild(editButton);
        actionButtons.appendChild(deleteButton);
    } else if (isEtudiant) {
        // Bouton pour les étudiants
        const applyButton = document.createElement('button');
        applyButton.className = 'apply-button';
        applyButton.textContent = 'Postuler';
        applyButton.onclick = () => showApplicationForm(offre.Id_Offre);
        
        actionButtons.appendChild(applyButton);
    }
    
    card.appendChild(actionButtons);
    return card;
}

// Modifier la fonction showMainMenu pour masquer les boutons selon le rôle
async function showMainMenu() {
    const userRole = await checkUserRole();
    const isEntreprise = userRole === 'entreprise';
    const isEtudiant = userRole === 'etudiant';
    
    const container = document.querySelector('.container');
    const ul = container.querySelector('ul');
    ul.innerHTML = ''; // Vider le menu existant
    
    // Boutons communs
    const searchBtn = document.createElement('li');
    searchBtn.innerHTML = '<button id="searchBtn"><i class="fas fa-search"></i>Rechercher une offre</button>';
    ul.appendChild(searchBtn);
    
    // Boutons spécifiques aux entreprises
    if (isEntreprise) {
        const createBtn = document.createElement('li');
        createBtn.innerHTML = '<button id="createBtn"><i class="fas fa-plus-circle"></i>Créer une offre</button>';
        ul.appendChild(createBtn);
        
        const editBtn = document.createElement('li');
        editBtn.innerHTML = '<button id="editBtn"><i class="fas fa-edit"></i>Modifier une offre</button>';
        ul.appendChild(editBtn);
        
        const deleteBtn = document.createElement('li');
        deleteBtn.innerHTML = '<button id="deleteBtn"><i class="fas fa-trash-alt"></i>Supprimer une offre</button>';
        ul.appendChild(deleteBtn);
    }
    
    // Bouton Mes candidatures pour les étudiants
    if (isEtudiant) {
        const myApplicationsBtn = document.createElement('li');
        myApplicationsBtn.innerHTML = '<button id="myApplicationsBtn"><i class="fas fa-file-alt"></i>Mes candidatures</button>';
        ul.appendChild(myApplicationsBtn);
    }
    
    // Ajouter les écouteurs d'événements
    document.getElementById('searchBtn').addEventListener('click', searchOffers);
    if (isEntreprise) {
        document.getElementById('createBtn').addEventListener('click', createOffer);
        document.getElementById('editBtn').addEventListener('click', editOffer);
        document.getElementById('deleteBtn').addEventListener('click', deleteOffer);
    }
    if (isEtudiant) {
        document.getElementById('myApplicationsBtn').addEventListener('click', showMyApplications);
    }
}

// Dashboard functions
let currentPage = 1;
const itemsPerPage = 5;
let sortedOffers = [];
let sortType = 'alphabetical';

function initDashboard() {
    loadDashboardData();
    
    // Event listeners for sorting and refresh
    document.getElementById('sort-options').addEventListener('change', function() {
        sortType = this.value;
        sortOffers();
        displayDashboardOffers();
    });
    
    document.getElementById('refresh-dashboard').addEventListener('click', function() {
        loadDashboardData();
    });
    
    // Add search functionality
    document.getElementById('dashboard-search-btn').addEventListener('click', function() {
        searchDashboardOffers();
    });
    
    // Add enter key event for search input
    document.getElementById('dashboard-search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchDashboardOffers();
        }
    });
}

function searchDashboardOffers() {
    const searchValue = document.getElementById('dashboard-search-input').value.trim().toLowerCase();
    
    if (searchValue === '') {
        // If search is empty, show all offers
        displayDashboardOffers();
        return;
    }
    
    // Filter offers based on search term
    const filteredOffers = sortedOffers.filter(offer => 
        offer.titre_offre.toLowerCase().includes(searchValue) ||
        offer.nom_entreprise.toLowerCase().includes(searchValue) ||
        (offer.description_offre && offer.description_offre.toLowerCase().includes(searchValue)) ||
        (offer.competences_noms && offer.competences_noms.toLowerCase().includes(searchValue))
    );
    
    // Display filtered offers
    displayFilteredOffers(filteredOffers);
}

function displayFilteredOffers(filteredOffers) {
    const offersListElement = document.getElementById('offers-list');
    offersListElement.innerHTML = '';
    
    if (filteredOffers.length === 0) {
        offersListElement.innerHTML = '<div class="no-data">Aucune offre ne correspond à votre recherche</div>';
        document.getElementById('dashboard-pagination').innerHTML = '';
        return;
    }
    
    filteredOffers.forEach(offer => {
        const offerElement = createOfferElement(offer);
        offersListElement.appendChild(offerElement);
    });
    
    // Hide pagination for filtered results
    document.getElementById('dashboard-pagination').innerHTML = '';
}

async function loadDashboardData() {
    try {
        const offersListElement = document.getElementById('offers-list');
        offersListElement.innerHTML = '<div class="loader">Chargement des offres...</div>';
        
        const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=offres', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des offres');
        }
        
        const data = await response.json();
        sortedOffers = data.offres || [];
        
        if (sortedOffers.length === 0) {
            offersListElement.innerHTML = '<div class="no-data">Aucune offre disponible</div>';
            return;
        }
        
        sortOffers();
        displayDashboardOffers();
    } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
        document.getElementById('offers-list').innerHTML = 
            '<div class="error">Erreur lors du chargement des offres. Veuillez réessayer.</div>';
    }
}

function sortOffers() {
    switch (sortType) {
        case 'alphabetical':
            sortedOffers.sort((a, b) => a.titre_offre.localeCompare(b.titre_offre));
            break;
        case 'company':
            sortedOffers.sort((a, b) => a.nom_entreprise.localeCompare(b.nom_entreprise));
            break;
        case 'date':
            sortedOffers.sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
            break;
        case 'skills':
            sortedOffers.sort((a, b) => {
                const skillsA = a.competences_noms || '';
                const skillsB = b.competences_noms || '';
                return skillsA.localeCompare(skillsB);
            });
            break;
        case 'duration':
            sortedOffers.sort((a, b) => {
                const durationA = calculateDuration(a.date_debut, a.date_fin);
                const durationB = calculateDuration(b.date_debut, b.date_fin);
                return durationA - durationB;
            });
            break;
        case 'wishlist':
            sortedOffers.sort((a, b) => b.in_wishlist - a.in_wishlist);
            break;
    }
}

function calculateDuration(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return (endDate - startDate) / (1000 * 60 * 60 * 24); // Duration in days
}

function createOfferElement(offer) {
    const offerElement = document.createElement('div');
    offerElement.className = 'offer-item';
    
    // Format dates
    const startDate = new Date(offer.date_debut).toLocaleDateString();
    const endDate = new Date(offer.date_fin).toLocaleDateString();
    
    // Calculate duration
    const durationDays = calculateDuration(offer.date_debut, offer.date_fin);
    const durationText = durationDays > 30 
        ? `${Math.round(durationDays / 30)} mois` 
        : `${durationDays} jours`;
    
    // Extract skills
    const skills = offer.competences_noms ? offer.competences_noms.split(', ') : [];
    const skillsHtml = skills.length > 0 
        ? `<div class="skills">${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</div>`
        : '';
    
    // Ajouter la structure de l'offre
    offerElement.innerHTML = `
        <h3>${offer.titre_offre}</h3>
        <p class="company"><i class="fas fa-building"></i> ${offer.nom_entreprise}</p>
        <p><i class="fas fa-calendar-alt"></i> Du ${startDate} au ${endDate} (${durationText})</p>
        <p><i class="fas fa-euro-sign"></i> ${offer.remuneration} €</p>
        ${skillsHtml}
        ${offer.in_wishlist ? '<p class="wishlist-badge"><i class="fas fa-heart"></i> Dans votre wishlist</p>' : ''}
    `;
    
    // Add action buttons (edit and delete)
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'offer-actions';
    
    // Function to check user role
    checkUserRole().then(role => {
        // Only show edit/delete buttons for admin, pilote or entreprise
        if (role === 'admin' || role === 'pilote' || role === 'entreprise') {
            // Edit button
            const editButton = document.createElement('button');
            editButton.className = 'offer-action-btn edit';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = 'Modifier l\'offre';
            editButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent opening details
                quickEditOffer(offer.Id_Offre);
            });
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'offer-action-btn delete';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.title = 'Supprimer l\'offre';
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent opening details
                quickDeleteOffer(offer.Id_Offre);
            });
            
            // Add buttons to container
            actionsContainer.appendChild(editButton);
            actionsContainer.appendChild(deleteButton);
            
            // Add container to offer element
            offerElement.appendChild(actionsContainer);
        }
    });
    
    // Add click event to show details
    offerElement.addEventListener('click', function() {
        showDashboardOfferDetails(offer.Id_Offre);
    });
    
    return offerElement;
}

// Function to quickly edit an offer
async function quickEditOffer(offerId) {
    const offer = sortedOffers.find(o => o.Id_Offre === offerId);
    if (!offer) return;
    
    try {
        // Load competences and entreprises
        const competencesPromise = fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=competences', {
            credentials: 'include'
        }).then(response => response.json());
        
        const entreprisesPromise = fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php?action=entreprises', {
            credentials: 'include'
        }).then(response => response.json());
        
        const [competences, entreprises] = await Promise.all([competencesPromise, entreprisesPromise]);
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: rgba(40, 40, 40, 0.95);
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 15px;
            padding: 30px;
            position: relative;
        `;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #F5DEB3;
            font-size: 24px;
            cursor: pointer;
            padding: 5px 10px;
        `;
        closeButton.addEventListener('click', function() {
            document.body.removeChild(modalContainer);
        });
        
        // Format options for competences and entreprises
        const competencesOptions = competences.map(c => 
            `<option value="${c.Id_competences}" ${offer.competences.split(',').includes(c.Id_competences.toString()) ? 'selected' : ''}>${c.nom_competences}</option>`
        ).join('');
        
        const entreprisesOptions = entreprises.map(e => 
            `<option value="${e.Id_Entreprise}" ${offer.Id_Entreprise == e.Id_Entreprise ? 'selected' : ''}>${e.nom_entreprise}</option>`
        ).join('');
        
        // Create form HTML
        modalContent.innerHTML = `
            <h2>Modifier l'offre</h2>
            <form id="edit-offer-form" class="edit-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="edit-title">Titre</label>
                        <input type="text" id="edit-title" value="${offer.titre_offre}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-company">Entreprise</label>
                        <select id="edit-company" required>
                            <option value="">Sélectionner une entreprise</option>
                            ${entreprisesOptions}
                        </select>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="edit-description">Description</label>
                        <textarea id="edit-description" rows="4" required>${offer.description_offre}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-salary">Rémunération (€)</label>
                        <input type="number" id="edit-salary" value="${offer.remuneration}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-start-date">Date de début</label>
                        <input type="date" id="edit-start-date" value="${offer.date_debut}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-end-date">Date de fin</label>
                        <input type="date" id="edit-end-date" value="${offer.date_fin}" required>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="edit-skills">Compétences requises</label>
                        <select id="edit-skills" multiple>
                            ${competencesOptions}
                        </select>
                        <p class="help-text">Maintenez Ctrl pour sélectionner plusieurs compétences</p>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Enregistrer les modifications</button>
                </div>
            </form>
        `;
        
        // Add styles for the form
        const style = document.createElement('style');
        style.textContent = `
            .edit-form {
                color: #F5DEB3;
            }
            
            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group.full-width {
                grid-column: span 2;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                color: #F5DEB3;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #6D4C41;
                border-radius: 5px;
                color: #F5DEB3;
                font-family: 'NoitaBlackletter', serif;
            }
            
            .form-group select[multiple] {
                height: 150px;
            }
            
            .help-text {
                font-size: 0.8rem;
                color: rgba(245, 222, 179, 0.7);
                margin-top: 5px;
            }
            
            .form-actions {
                margin-top: 25px;
                text-align: center;
            }
            
            .submit-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 5px;
                cursor: pointer;
                font-family: 'NoitaBlackletter', serif;
                font-size: 1rem;
                transition: background 0.3s;
            }
            
            .submit-btn:hover {
                background: #45a049;
            }
        `;
        document.head.appendChild(style);
        
        // Add close button to modal
        modalContent.appendChild(closeButton);
        
        // Add modal to page
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);
        
        // Add escape key listener
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modalContainer);
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
        
        // Add click outside to close
        modalContainer.addEventListener('click', function(e) {
            if (e.target === modalContainer) {
                document.body.removeChild(modalContainer);
            }
        });
        
        // Handle form submission
        document.getElementById('edit-offer-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const title = document.getElementById('edit-title').value.trim();
            const companyId = document.getElementById('edit-company').value;
            const description = document.getElementById('edit-description').value.trim();
            const skillsSelect = document.getElementById('edit-skills');
            const skills = Array.from(skillsSelect.selectedOptions).map(option => option.value);
            const salary = document.getElementById('edit-salary').value;
            const startDate = document.getElementById('edit-start-date').value;
            const endDate = document.getElementById('edit-end-date').value;
            
            // Validate form inputs
            if (!title || !companyId || !description || skills.length === 0 || !salary || !startDate || !endDate) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            try {
                // Submit form data
                const response = await fetch('http://localhost/3Dsite%20version%201.3/offres_operations.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        Id_Offre: offer.Id_Offre,
                        titre: title,
                        description: description,
                        remuneration: salary,
                        date_debut: startDate,
                        date_fin: endDate,
                        Id_Entreprise: companyId,
                        competences: skills
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour de l\'offre');
                }
                
                const result = await response.json();
                
                if (result.success) {
                    // Close modal
                    document.body.removeChild(modalContainer);
                    
                    // Reload data
                    loadDashboardData();
                    
                    // Show success message
                    alert('Offre mise à jour avec succès !');
                } else {
                    throw new Error(result.error || 'Erreur lors de la mise à jour de l\'offre');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert(error.message || 'Erreur lors de la mise à jour de l\'offre');
            }
        });
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des données');
    }
}

// Function to quickly delete an offer
function quickDeleteOffer(offerId) {
    const offer = sortedOffers.find(o => o.Id_Offre === offerId);
    if (!offer) return;
    
    // Create confirmation modal
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: rgba(40, 40, 40, 0.95);
        width: 100%;
        max-width: 500px;
        border-radius: 15px;
        padding: 30px;
        position: relative;
        text-align: center;
    `;
    
    // Add modal content
    modalContent.innerHTML = `
        <h2 style="color: #F5DEB3; margin-top: 0;">Confirmation de suppression</h2>
        <p style="color: #F5DEB3; margin-bottom: 30px;">Êtes-vous sûr de vouloir supprimer l'offre "${offer.titre_offre}" ?</p>
        <div style="display: flex; justify-content: center; gap: 20px;">
            <button id="cancel-delete" style="background: #9E9E9E; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-family: 'NoitaBlackletter', serif;">Annuler</button>
            <button id="confirm-delete" style="background: #F44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-family: 'NoitaBlackletter', serif;">Supprimer</button>
        </div>
    `;
    
    // Add modal to page
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Handle cancel button
    document.getElementById('cancel-delete').addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    
    // Handle confirm button
    document.getElementById('confirm-delete').addEventListener('click', async function() {
        try {
            // Submit delete request
            const response = await fetch(`http://localhost/3Dsite%20version%201.3/offres_operations.php?id=${offer.Id_Offre}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'offre');
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Close modal
                document.body.removeChild(modalContainer);
                
                // Reload data
                loadDashboardData();
                
                // Show success message
                alert('Offre supprimée avec succès !');
            } else {
                throw new Error(result.error || 'Erreur lors de la suppression de l\'offre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de la suppression de l\'offre');
        }
    });
    
    // Add escape key listener
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modalContainer);
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
    
    // Add click outside to close
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
}

function displayDashboardOffers() {
    const offersListElement = document.getElementById('offers-list');
    offersListElement.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, sortedOffers.length);
    const pageOffers = sortedOffers.slice(start, end);
    
    if (pageOffers.length === 0) {
        offersListElement.innerHTML = '<div class="no-data">Aucune offre à afficher</div>';
        return;
    }
    
    pageOffers.forEach(offer => {
        const offerElement = createOfferElement(offer);
        offersListElement.appendChild(offerElement);
    });
    
    // Update pagination
    updatePagination();
}

function updatePagination() {
    const paginationElement = document.getElementById('dashboard-pagination');
    paginationElement.innerHTML = '';
    
    const totalPages = Math.ceil(sortedOffers.length / itemsPerPage);
    
    if (totalPages <= 1) {
        return;
    }
    
    // Add previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.addEventListener('click', () => {
            currentPage--;
            displayDashboardOffers();
        });
        paginationElement.appendChild(prevButton);
    }
    
    // Add page numbers
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-btn';
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayDashboardOffers();
        });
        paginationElement.appendChild(pageButton);
    }
    
    // Add next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-btn';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.addEventListener('click', () => {
            currentPage++;
            displayDashboardOffers();
        });
        paginationElement.appendChild(nextButton);
    }
}

// Instead of using createForm which is causing errors, create a simple modal
function showDashboardOfferDetails(offerId) {
    const offer = sortedOffers.find(o => o.Id_Offre === offerId);
    if (!offer) return;
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: rgba(40, 40, 40, 0.95);
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 15px;
        padding: 30px;
        position: relative;
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: #F5DEB3;
        font-size: 24px;
        cursor: pointer;
        padding: 5px 10px;
    `;
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    
    // Format dates
    const startDate = new Date(offer.date_debut).toLocaleDateString();
    const endDate = new Date(offer.date_fin).toLocaleDateString();
    const duration = calculateDuration(offer.date_debut, offer.date_fin);
    
    // Create content HTML
    modalContent.innerHTML = `
        <div class="offer-details">
            <div class="detail-header">
                <h3>${offer.titre_offre}</h3>
                <p class="company-name">${offer.nom_entreprise}</p>
            </div>
            
            <div class="detail-section">
                <h4>Description</h4>
                <p>${offer.description_offre}</p>
            </div>
            
            <div class="detail-section">
                <h4>Informations</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Rémunération:</span>
                        <span class="detail-value">${offer.remuneration} €</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date de début:</span>
                        <span class="detail-value">${startDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date de fin:</span>
                        <span class="detail-value">${endDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Durée:</span>
                        <span class="detail-value">${duration} jours</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Candidatures:</span>
                        <span class="detail-value">${offer.nombre_candidatures || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Compétences requises</h4>
                <div class="skills-container">
                    ${offer.competences_noms ? 
                        offer.competences_noms.split(', ').map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('') : 
                        '<p>Aucune compétence spécifiée</p>'
                    }
                </div>
            </div>
            
            <div class="detail-actions">
                ${offer.has_applied == 1 ? 
                    '<button class="action-btn disabled"><i class="fas fa-check"></i> Déjà postulé</button>' : 
                    `<button class="action-btn apply" onclick="window.applyForOffer(${offer.Id_Offre})">
                        <i class="fas fa-paper-plane"></i> Postuler
                    </button>`
                }
                ${offer.in_wishlist ? 
                    `<button class="action-btn wishlist-remove" onclick="window.removeFromWishlist(${offer.Id_Offre})">
                        <i class="fas fa-heart-broken"></i> Retirer de la wishlist
                    </button>` : 
                    `<button class="action-btn wishlist-add" onclick="window.addToWishlist(${offer.Id_Offre})">
                        <i class="fas fa-heart"></i> Ajouter à la wishlist
                    </button>`
                }
            </div>
        </div>
    `;
    
    // Add close button to modal
    modalContent.appendChild(closeButton);
    
    // Add modal to page
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Add escape key listener
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modalContainer);
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
    
    // Add click outside to close
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
}