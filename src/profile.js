document.addEventListener('DOMContentLoaded', function() {
    const profileBox = document.getElementById('profile-box');
    const profileName = document.getElementById('profile-name').querySelector('span');
    const profileEmail = document.getElementById('profile-email').querySelector('span');
    const profileRole = document.getElementById('profile-role').querySelector('span');
    const wishlistItems = document.getElementById('wishlist-items');
    const wishlistPagination = document.getElementById('wishlist-pagination');

    let userData = null;
    let currentPage = 1;
    let itemsPerPage = 3; // Valeur par défaut, peut être modifiée selon la taille d'écran

    // Fonction pour ajuster le nombre d'éléments par page en fonction de la taille de l'écran
    function adjustItemsPerPage() {
        const windowWidth = window.innerWidth;
        if (windowWidth <= 576) {
            itemsPerPage = 1;
        } else if (windowWidth <= 992) {
            itemsPerPage = 2;
        } else {
            itemsPerPage = 3;
        }
        
        // Si les données utilisateur sont déjà chargées, mettre à jour la wishlist
        if (userData) {
            currentPage = 1; // Réinitialiser à la première page
            updateWishlist();
        }
    }

    // Fonction pour vérifier si l'utilisateur est connecté et récupérer ses données
    async function getUserData() {
        try {
            const response = await fetch('http://localhost/3Dsite%20version%201.3/get_user_data.php', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }

            const data = await response.json();
            if (data.success) {
                userData = data;
                updateProfile();
                updateWishlist();
            } else {
                console.error('Erreur:', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    // Fonction pour mettre à jour les informations du profil
    function updateProfile() {
        if (!userData || !userData.user) return;

        const user = userData.user;
        profileName.textContent = `${user.prenom} ${user.nom_utilisateur}`;
        profileEmail.textContent = user.email;
        profileRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }

    // Fonction pour mettre à jour la wishlist avec pagination
    function updateWishlist() {
        if (!userData || !userData.wishlist) return;

        const wishlist = userData.wishlist;
        const totalPages = Math.ceil(wishlist.length / itemsPerPage);
        
        // Calculer les éléments à afficher pour la page actuelle
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, wishlist.length);
        const currentItems = wishlist.slice(startIndex, endIndex);

        // Vider le conteneur
        wishlistItems.innerHTML = '';

        // Si aucun élément dans la wishlist
        if (wishlist.length === 0) {
            wishlistItems.innerHTML = '<div class="loader">Aucune offre dans votre wishlist</div>';
            wishlistPagination.innerHTML = '';
            return;
        }

        // Ajouter les éléments de la page actuelle
        currentItems.forEach(item => {
            const dateDebut = new Date(item.date_debut).toLocaleDateString('fr-FR');
            const dateFin = new Date(item.date_fin).toLocaleDateString('fr-FR');
            
            const itemElement = document.createElement('div');
            itemElement.classList.add('wishlist-item');
            itemElement.innerHTML = `
                <h3>${item.titre_offre}</h3>
                <p class="company"><i class="fas fa-building"></i> ${item.nom_entreprise}</p>
                <p class="description"><i class="fas fa-info-circle"></i> ${item.description_offre.substring(0, 100)}${item.description_offre.length > 100 ? '...' : ''}</p>
                <p><i class="fas fa-euro-sign"></i> ${item.remuneration} €</p>
                <p><i class="fas fa-calendar-alt"></i> Du ${dateDebut} au ${dateFin}</p>
                ${item.competences_noms ? `<p class="competences"><i class="fas fa-tools"></i> ${item.competences_noms}</p>` : ''}
            `;
            wishlistItems.appendChild(itemElement);
        });

        // Créer la pagination
        updatePagination(totalPages);
    }

    // Fonction pour mettre à jour la pagination
    function updatePagination(totalPages) {
        wishlistPagination.innerHTML = '';

        // Bouton précédent
        const prevButton = document.createElement('button');
        prevButton.classList.add('pagination-btn');
        prevButton.textContent = 'Précédent';
        prevButton.disabled = currentPage === 1;
        if (currentPage === 1) prevButton.classList.add('disabled');
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateWishlist();
            }
        });
        wishlistPagination.appendChild(prevButton);

        // Boutons de page - Limiter l'affichage des boutons sur petit écran
        const maxVisibleButtons = window.innerWidth <= 576 ? 3 : 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
        
        // Ajuster startPage si on est proche de la fin
        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('pagination-btn');
            pageButton.textContent = i;
            if (i === currentPage) pageButton.classList.add('active');
            pageButton.addEventListener('click', () => {
                currentPage = i;
                updateWishlist();
            });
            wishlistPagination.appendChild(pageButton);
        }

        // Bouton suivant
        const nextButton = document.createElement('button');
        nextButton.classList.add('pagination-btn');
        nextButton.textContent = 'Suivant';
        nextButton.disabled = currentPage === totalPages;
        if (currentPage === totalPages) nextButton.classList.add('disabled');
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateWishlist();
            }
        });
        wishlistPagination.appendChild(nextButton);
    }

    // Gestion de l'affichage de la boîte de profil lors du défilement
    function handleScroll() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Afficher la boîte de profil lorsque l'utilisateur a défilé un peu
        if (scrollPosition > windowHeight * 0.5 && scrollPosition < windowHeight * 1.5) {
            profileBox.classList.add('visible');
        } else {
            profileBox.classList.remove('visible');
        }
    }

    // Écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        adjustItemsPerPage();
    });

    // Écouteur d'événement pour le défilement
    window.addEventListener('scroll', handleScroll);

    // Initialiser la page
    adjustItemsPerPage(); // Ajuster le nombre d'éléments par page selon la taille d'écran initiale
    getUserData();
}); 