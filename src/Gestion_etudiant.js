document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-container");
    const modalTitle = document.getElementById("modal-title");
    const form = document.getElementById("student-form");
    const statsContainer = document.getElementById("stats-container"); 
    const content = document.querySelector("#parchment");
    const container = document.querySelector("#contain");

    if (!modal || !modalTitle || !form || !statsContainer) {
        console.error("One or more elements are missing from the DOM.");
        return;
    }

    const API_URL = 'http://localhost/3Dsite%20version%201.3/api_gestion_etudiant.php';
    
    // Current page state for pagination
    let currentPage = 1;
    let totalPages = 1;
    const studentsPerPage = 5;
    
    // Current selected student for edit/delete
    let selectedStudent = null;

    // Default font settings for consistency
    const fontSettings = {
        title: "font-family: 'NoitaBlackletter', serif; font-size: 1.8em; letter-spacing: 0.06em;",
        heading: "font-family: 'NoitaBlackletter', serif; font-size: 1.1em; letter-spacing: 0.05em;",
        text: "font-family: 'NoitaBlackletter', serif; font-size: 0.85em; letter-spacing: 0.04em;",
        button: "font-family: Arial, Helvetica, sans-serif; font-size: 0.9em;"
    };

    // Load students on page load
    window.addEventListener('load', () => {
        loadStudents(currentPage);
    });

    // Function to load students with pagination
    const loadStudents = async (page = 1, limit = studentsPerPage) => {
        try {
            const response = await fetch(`${API_URL}?action=list&page=${page}&limit=${limit}`);
            const result = await response.json();
            
            if (result.success) {
                displayStudentsList(result.data, result.pagination);
            } else {
                throw new Error(result.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error(`Erreur lors du chargement des étudiants : ${error.message}`);
            statsContainer.innerHTML = `<div class="error-message">Erreur lors du chargement des étudiants</div>`;
            statsContainer.classList.remove('hidden');
        }
    };

    // Function to get a student by ID
    const getStudentById = async (id) => {
        try {
            const response = await fetch(`${API_URL}?action=get&id=${id}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de l'étudiant : ${error.message}`);
            return null;
        }
    };

    // Function to create a new student account
    const createStudent = async (studentData) => {
        try {
            const formData = new FormData();
            formData.append('action', 'create');
            formData.append('nom', studentData.nom);
            formData.append('prenom', studentData.prenom);
            formData.append('email', studentData.email);
            formData.append('password', studentData.password);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show browser alert for successful creation
                alert(`Compte étudiant créé avec succès pour ${studentData.prenom} ${studentData.nom}`);
                
                // Close modal and refresh the list
                closeModal();
                loadStudents(1); // Reload the first page to show the new student
            } else {
                throw new Error(result.error || 'Une erreur est survenue');
            }
        } catch (error) {
            displayErrorMessage(`Erreur lors de la création du compte : ${error.message}`);
        }
    };
    
    // Function to update a student account
    const updateStudent = async (studentData) => {
        try {
            const formData = new FormData();
            formData.append('action', 'update');
            formData.append('id', studentData.id);
            formData.append('nom', studentData.nom);
            formData.append('prenom', studentData.prenom);
            formData.append('email', studentData.email);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show browser alert for successful update
                alert(`Compte étudiant mis à jour avec succès pour ${studentData.prenom} ${studentData.nom}`);
                
                // Close modal and refresh the list
                closeModal();
                loadStudents(currentPage); // Reload the current page
            } else {
                throw new Error(result.error || 'Une erreur est survenue');
            }
        } catch (error) {
            displayErrorMessage(`Erreur lors de la mise à jour du compte : ${error.message}`);
        }
    };
    
    // Function to delete a student account
    const deleteStudent = async (id) => {
        try {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id', id);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show browser alert for successful deletion
                alert(`Compte étudiant supprimé avec succès`);
                
                // Close modal and refresh the list
                closeModal();
                loadStudents(1); // Reload the first page after deletion
            } else {
                throw new Error(result.error || 'Une erreur est survenue');
            }
        } catch (error) {
            displayErrorMessage(`Erreur lors de la suppression du compte : ${error.message}`);
        }
    };
    
    // Function to populate the student selection dropdown
    const populateStudentSelect = async (selectElement) => {
        try {
            const response = await fetch(`${API_URL}?action=list&limit=100`); // Get a large list
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                selectElement.innerHTML = '<option value="">Sélectionnez un étudiant</option>';
                
                result.data.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.Id_Utilisateur;
                    option.textContent = `${student.nom_utilisateur} ${student.prenom} (${student.email})`;
                    selectElement.appendChild(option);
                });
            } else {
                throw new Error(result.error || 'Aucun étudiant trouvé');
            }
        } catch (error) {
            console.error(`Erreur lors du chargement des étudiants : ${error.message}`);
            selectElement.innerHTML = '<option value="">Erreur de chargement</option>';
        }
    };
    
    // Function to load student data for editing
    const loadStudentForEdit = async (id) => {
        try {
            const student = await getStudentById(id);
            
            if (student) {
                // Store the selected student for reference
                selectedStudent = student;
                
                // Populate the form fields
                document.getElementById('edit-nom').value = student.nom_utilisateur;
                document.getElementById('edit-prenom').value = student.prenom;
                document.getElementById('edit-email').value = student.email;
            } else {
                throw new Error('Étudiant non trouvé');
            }
        } catch (error) {
            displayErrorMessage(`Erreur : ${error.message}`);
        }
    };
    
    // Function to display success message
    const displaySuccessMessage = (message) => {
        statsContainer.innerHTML = `
            <div class="success-message">
                <p>${message}</p>
            </div>
        `;
        statsContainer.classList.remove('hidden');
        setTimeout(() => {
            loadStudents(currentPage);
        }, 3000);
    };
    
    // Function to display error message
    const displayErrorMessage = (message) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // If there's a form, add the error to the form
        if (form.querySelector('.form-error')) {
            form.querySelector('.form-error').remove();
        }
        
        const formError = document.createElement('div');
        formError.className = 'form-error';
        formError.style.color = '#D32F2F';
        formError.style.marginTop = '10px';
        formError.style.padding = '10px';
        formError.style.backgroundColor = '#FFEBEE';
        formError.style.borderRadius = '5px';
        formError.style.fontSize = '0.9em';
        formError.textContent = message;
        
        form.appendChild(formError);
    };

    // Function to get internship details
    const getInternshipDetails = async (email) => {
        try {
            const response = await fetch(`${API_URL}?action=internships&email=${encodeURIComponent(email)}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error(`Erreur lors du chargement des stages : ${error.message}`);
            return [];
        }
    };

    // Function to display internship details
    const displayInternshipDetails = async (email, studentName) => {
        statsContainer.innerHTML = `<div class="loading-spinner">Chargement des stages...</div>`;
        
        try {
            const internships = await getInternshipDetails(email);
            
            statsContainer.innerHTML = '';
            
            // Create a back button
            const backBtn = document.createElement('button');
            backBtn.textContent = '← Retour à la liste';
            backBtn.style.marginBottom = '20px';
            backBtn.addEventListener('click', () => loadStudents(currentPage));
            statsContainer.appendChild(backBtn);
            
            // Create title
            const title = document.createElement('h2');
            title.textContent = `Stages postulés par ${studentName}`;
            title.style.textAlign = 'center';
            title.style.color = '#6D4C41';
            title.style.margin = '20px 0';
            title.style.fontFamily = 'NoitaBlackletter, serif';
            statsContainer.appendChild(title);
            
            if (internships.length === 0) {
                const noInternships = document.createElement('p');
                noInternships.textContent = 'Aucun stage postulé.';
                noInternships.style.textAlign = 'center';
                noInternships.style.fontFamily = 'NoitaBlackletter, serif';
                noInternships.style.padding = '20px';
                noInternships.style.backgroundColor = '#FFF3E0';
                noInternships.style.borderRadius = '8px';
                noInternships.style.border = '1px dashed #8B5A2B';
                statsContainer.appendChild(noInternships);
            } else {
                const internshipsGrid = document.createElement('div');
                internshipsGrid.style.display = 'grid';
                internshipsGrid.style.gap = '15px';
                
                internships.forEach(internship => {
                    const card = document.createElement('div');
                    card.style.border = '1px solid #6D4C41';
                    card.style.borderRadius = '8px';
                    card.style.padding = '15px';
                    card.style.backgroundColor = '#FFF3E0';
                    card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    
                    // Format date
                    const candidatureDate = new Date(internship.date_candidature);
                    const formattedDate = candidatureDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    card.innerHTML = `
                        <h3 style="margin: 0 0 10px 0; color: #6D4C41; font-family: 'NoitaBlackletter', serif;">${internship.titre_offre}</h3>
                        <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif;"><strong>Entreprise:</strong> ${internship.nom_entreprise}</p>
                        <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif;"><strong>Date de candidature:</strong> ${formattedDate}</p>
                        <p style="margin: 10px 0 5px; font-family: 'NoitaBlackletter', serif;"><strong>Description:</strong></p>
                        <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif; font-size: 0.9em; font-style: italic;">${internship.description_offre}</p>
                    `;
                    
                    internshipsGrid.appendChild(card);
                });
                
                statsContainer.appendChild(internshipsGrid);
            }
            
        } catch (error) {
            statsContainer.innerHTML = `<div class="error-message">Erreur lors du chargement des stages: ${error.message}</div>`;
        }
        
        statsContainer.classList.remove('hidden');
        ScrollHeight();
    };

    // Function to display students list with pagination
    const displayStudentsList = (students, pagination) => {
        statsContainer.innerHTML = '';
        
        // Create title for the list
        const listTitle = document.createElement('h2');
        listTitle.textContent = 'Liste des Étudiants';
        listTitle.style.textAlign = 'center';
        listTitle.style.color = '#6D4C41';
        listTitle.style.marginBottom = '20px';
        listTitle.style.fontFamily = 'NoitaBlackletter, serif';
        statsContainer.appendChild(listTitle);
        
        if (students.length === 0) {
            const noDataMsg = document.createElement('p');
            noDataMsg.textContent = 'Aucun étudiant trouvé.';
            noDataMsg.style.textAlign = 'center';
            noDataMsg.style.fontFamily = 'NoitaBlackletter, serif';
            statsContainer.appendChild(noDataMsg);
        } else {
            // Create container for student cards
            const studentsGrid = document.createElement('div');
            studentsGrid.style.display = 'grid';
            studentsGrid.style.gap = '15px';
            
            // Create student cards
            students.forEach(student => {
                const studentCard = document.createElement('div');
                studentCard.style.border = '1px solid #6D4C41';
                studentCard.style.borderRadius = '8px';
                studentCard.style.padding = '15px';
                studentCard.style.backgroundColor = '#F5DEB3';
                studentCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                studentCard.style.position = 'relative';
                
                // Display student details
                studentCard.innerHTML = `
                    <h3 style="margin: 0 0 10px 0; color: #6D4C41; font-family: 'NoitaBlackletter', serif;">${student.nom_utilisateur} ${student.prenom}</h3>
                    <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif;"><strong>Email:</strong> ${student.email}</p>
                    <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif;"><strong>Stages postulés:</strong> ${student.internship_count}</p>
                `;
                
                // Add a view details button if they have internships
                if (parseInt(student.internship_count) > 0) {
                    const viewBtn = document.createElement('button');
                    viewBtn.textContent = 'Voir les stages';
                    viewBtn.style.marginTop = '10px';
                    viewBtn.addEventListener('click', () => {
                        displayInternshipDetails(student.email, `${student.nom_utilisateur} ${student.prenom}`);
                    });
                    studentCard.appendChild(viewBtn);
                }
                
                studentsGrid.appendChild(studentCard);
            });
            
            statsContainer.appendChild(studentsGrid);
            
            // Create pagination controls
            if (pagination && pagination.total_pages > 1) {
                currentPage = pagination.current_page;
                totalPages = pagination.total_pages;
                
                const paginationContainer = document.createElement('div');
                paginationContainer.style.display = 'flex';
                paginationContainer.style.justifyContent = 'center';
                paginationContainer.style.marginTop = '20px';
                paginationContainer.style.gap = '10px';
                
                // Previous button
                if (currentPage > 1) {
                    const prevBtn = document.createElement('button');
                    prevBtn.textContent = 'Précédent';
                    prevBtn.addEventListener('click', () => loadStudents(currentPage - 1));
                    paginationContainer.appendChild(prevBtn);
                }
                
                // Page numbers
                for (let i = 1; i <= pagination.total_pages; i++) {
                    const pageBtn = document.createElement('button');
                    pageBtn.textContent = i;
                    pageBtn.style.minWidth = '40px';
                    
                    if (i === currentPage) {
                        pageBtn.style.backgroundColor = '#8B5A2B';
                        pageBtn.style.color = 'white';
                    }
                    
                    pageBtn.addEventListener('click', () => loadStudents(i));
                    paginationContainer.appendChild(pageBtn);
                }
                
                // Next button
                if (currentPage < pagination.total_pages) {
                    const nextBtn = document.createElement('button');
                    nextBtn.textContent = 'Suivant';
                    nextBtn.addEventListener('click', () => loadStudents(currentPage + 1));
                    paginationContainer.appendChild(nextBtn);
                }
                
                statsContainer.appendChild(paginationContainer);
            }
        }
        
        statsContainer.classList.remove('hidden');
        ScrollHeight();
    };

    const openModal = (title, type) => {
        modalTitle.textContent = title;
        form.innerHTML = "";
        
        if (type === "chercher") {
            form.innerHTML = `
                <label for="search-input">Rechercher :</label>
                <input type="text" id="search-input" placeholder="Nom, prénom ou email">
                <button type="submit">Rechercher</button>
            `;
        } else if (type === "creer") {
            form.innerHTML = `
                <label for="student-nom">Nom :</label>
                <input type="text" id="student-nom" placeholder="Nom" required>

                <label for="student-prenom">Prénom :</label>
                <input type="text" id="student-prenom" placeholder="Prénom" required>

                <label for="student-email">Email :</label>
                <input type="email" id="student-email" placeholder="Email" required>
                
                <label for="student-password">Mot de passe :</label>
                <input type="password" id="student-password" placeholder="Mot de passe" 
                       pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}" required>
                <small style="color: #6D4C41; margin-top: -10px; font-size: 0.8em; font-family: Arial, sans-serif;">
                    Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
                </small>
                
                <label for="student-password-confirm">Confirmer le mot de passe :</label>
                <input type="password" id="student-password-confirm" placeholder="Confirmer le mot de passe" required>

                <button type="submit">Créer</button>
            `;
        } else if (type === "modifier") {
            form.innerHTML = `
                <label for="student-select">Sélectionnez un étudiant :</label>
                <select id="student-select" required>
                    <option value="">Chargement...</option>
                </select>
                
                <div id="edit-form" style="display: none; margin-top: 15px;">
                    <label for="edit-nom">Nom :</label>
                    <input type="text" id="edit-nom" placeholder="Nom" required>
    
                    <label for="edit-prenom">Prénom :</label>
                    <input type="text" id="edit-prenom" placeholder="Prénom" required>
    
                    <label for="edit-email">Email :</label>
                    <input type="email" id="edit-email" placeholder="Email" required>
                    
                    <button type="submit">Modifier</button>
                </div>
            `;
            
            // Populate the student selection dropdown
            const selectElement = document.getElementById('student-select');
            populateStudentSelect(selectElement);
            
            // Add change event to load student data when selected
            selectElement.addEventListener('change', async (e) => {
                const editForm = document.getElementById('edit-form');
                
                if (e.target.value) {
                    await loadStudentForEdit(e.target.value);
                    editForm.style.display = 'block';
                } else {
                    editForm.style.display = 'none';
                }
            });
        } else if (type === "supprimer") {
            form.innerHTML = `
                <label for="delete-student-select">Sélectionnez un étudiant à supprimer :</label>
                <select id="delete-student-select" required>
                    <option value="">Chargement...</option>
                </select>
                
                <div id="confirmation" style="display: none; margin-top: 15px;">
                    <p style="color: #D32F2F; font-weight: bold; text-align: center; font-family: Arial, sans-serif;">
                        ⚠️ Attention : Cette action est irréversible ⚠️
                    </p>
                    <p style="font-family: 'NoitaBlackletter', serif; text-align: center;">
                        Êtes-vous sûr de vouloir supprimer cet étudiant ?
                    </p>
                    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                        <button type="button" id="btn-cancel" style="background-color: #9E9E9E;">Annuler</button>
                        <button type="button" id="btn-confirm-delete" style="background-color: #D32F2F;">Supprimer</button>
                    </div>
                </div>
            `;
            
            // Populate the student selection dropdown
            const selectElement = document.getElementById('delete-student-select');
            populateStudentSelect(selectElement);
            
            // Show confirmation when a student is selected
            selectElement.addEventListener('change', async (e) => {
                const confirmation = document.getElementById('confirmation');
                
                if (e.target.value) {
                    const student = await getStudentById(e.target.value);
                    
                    if (student) {
                        // Store the selected student for reference
                        selectedStudent = student;
                        confirmation.style.display = 'block';
                    }
                } else {
                    confirmation.style.display = 'none';
                }
            });
            
            // Add event listeners for the confirmation buttons
            document.getElementById('btn-cancel')?.addEventListener('click', () => {
                document.getElementById('confirmation').style.display = 'none';
                document.getElementById('delete-student-select').value = '';
            });
            
            document.getElementById('btn-confirm-delete')?.addEventListener('click', async () => {
                if (selectedStudent && selectedStudent.Id_Utilisateur) {
                    await deleteStudent(selectedStudent.Id_Utilisateur);
                }
            });
        }

        modal.classList.add("visible");
        modal.classList.remove("hidden");
        ScrollHeight();
    };

    const closeModal = () => {
        modal.classList.add("hidden");
        modal.classList.remove("visible");
        ScrollHeight();
    };

    const displaySearchResults = (students) => {
        statsContainer.innerHTML = '';
        
        // Use NoitaBlackletter font for search results
        const resultTitle = document.createElement('h2');
        resultTitle.textContent = 'Résultats de recherche';
        resultTitle.style.textAlign = 'center';
        resultTitle.style.color = '#6D4C41';
        resultTitle.style.marginBottom = '20px';
        resultTitle.style.fontFamily = 'NoitaBlackletter, serif';
        statsContainer.appendChild(resultTitle);
        
        if (students.length === 0) {
            const noResults = document.createElement('p');
            noResults.textContent = 'Aucun étudiant trouvé.';
            noResults.style.textAlign = 'center';
            noResults.style.fontFamily = 'NoitaBlackletter, serif';
            statsContainer.appendChild(noResults);
        } else {
            const resultsDiv = document.createElement('div');
            resultsDiv.style.display = 'grid';
            resultsDiv.style.gap = '15px';
            
            students.forEach(student => {
                const studentCard = document.createElement('div');
                studentCard.style.border = '1px solid #6D4C41';
                studentCard.style.borderRadius = '8px';
                studentCard.style.padding = '15px';
                studentCard.style.backgroundColor = '#F5DEB3';
                studentCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                
                studentCard.innerHTML = `
                    <h3 style="margin: 0 0 10px 0; color: #6D4C41; font-family: 'NoitaBlackletter', serif;">${student.nom_utilisateur} ${student.prenom}</h3>
                    <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif;"><strong>Email:</strong> ${student.email}</p>
                    <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif;"><strong>Stages postulés:</strong> ${student.internship_count}</p>
                `;
                
                // Display internship details if there are any
                if (student.internships && student.internships.length > 0) {
                    const internshipsHeader = document.createElement('h4');
                    internshipsHeader.textContent = 'Stages postulés:';
                    internshipsHeader.style.margin = '15px 0 10px';
                    internshipsHeader.style.fontFamily = 'NoitaBlackletter, serif';
                    internshipsHeader.style.color = '#6D4C41';
                    studentCard.appendChild(internshipsHeader);
                    
                    student.internships.forEach(internship => {
                        const internshipItem = document.createElement('div');
                        internshipItem.style.margin = '10px 0';
                        internshipItem.style.padding = '10px';
                        internshipItem.style.backgroundColor = '#FFF3E0';
                        internshipItem.style.borderRadius = '5px';
                        internshipItem.style.border = '1px dashed #8B5A2B';
                        
                        // Format date
                        const candidatureDate = new Date(internship.date_candidature);
                        const formattedDate = candidatureDate.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                        
                        internshipItem.innerHTML = `
                            <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif;"><strong>${internship.titre_offre}</strong> - ${internship.nom_entreprise}</p>
                            <p style="margin: 5px 0; font-family: 'NoitaBlackletter', serif; font-size: 0.9em;">Date de candidature: ${formattedDate}</p>
                        `;
                        
                        studentCard.appendChild(internshipItem);
                    });
                } else if (student.internship_count > 0) {
                    // If we have a count but no details, show a button to view details
                    const viewBtn = document.createElement('button');
                    viewBtn.textContent = 'Voir les stages';
                    viewBtn.style.marginTop = '10px';
                    viewBtn.addEventListener('click', () => {
                        displayInternshipDetails(student.email, `${student.nom_utilisateur} ${student.prenom}`);
                    });
                    studentCard.appendChild(viewBtn);
                }
                
                resultsDiv.appendChild(studentCard);
            });
            
            statsContainer.appendChild(resultsDiv);
            
            // Add a back button to return to the list view
            const backBtn = document.createElement('button');
            backBtn.textContent = 'Retour à la liste';
            backBtn.style.marginTop = '20px';
            backBtn.style.marginLeft = 'auto';
            backBtn.style.marginRight = 'auto';
            backBtn.style.display = 'block';
            backBtn.addEventListener('click', () => loadStudents(currentPage));
            statsContainer.appendChild(backBtn);
        }
        
        statsContainer.classList.remove('hidden');
        ScrollHeight();
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        let action = modalTitle.textContent;

        if (action.includes("Chercher")) {
            const searchInput = document.getElementById("search-input");
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) {
                alert("Veuillez entrer un terme de recherche");
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}?action=search&term=${encodeURIComponent(searchTerm)}`);
                const result = await response.json();
                
                if (result.success) {
                    displaySearchResults(result.data);
                    closeModal();
                } else {
                    throw new Error(result.error || 'Une erreur est survenue');
                }
            } catch (error) {
                alert(`Erreur lors de la recherche : ${error.message}`);
            }
        } else if (action.includes("Créer")) {
            // Get form values
            const nom = document.getElementById("student-nom").value.trim();
            const prenom = document.getElementById("student-prenom").value.trim();
            const email = document.getElementById("student-email").value.trim();
            const password = document.getElementById("student-password").value;
            const confirmPassword = document.getElementById("student-password-confirm").value;
            
            // Basic validation
            if (!nom || !prenom || !email || !password || !confirmPassword) {
                displayErrorMessage("Tous les champs sont obligatoires");
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                displayErrorMessage("Format d'email invalide");
                return;
            }
            
            // Password validation
            if (password.length < 8) {
                displayErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
                return;
            }
            
            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
                displayErrorMessage("Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre");
                return;
            }
            
            // Confirm password
            if (password !== confirmPassword) {
                displayErrorMessage("Les mots de passe ne correspondent pas");
                return;
            }
            
            // All validation passed, create the account
            await createStudent({
                nom,
                prenom,
                email,
                password
            });
        } else if (action.includes("Modifier")) {
            // Check if a student is selected
            if (!selectedStudent || !selectedStudent.Id_Utilisateur) {
                displayErrorMessage("Veuillez sélectionner un étudiant");
                return;
            }
            
            // Get form values
            const nom = document.getElementById("edit-nom").value.trim();
            const prenom = document.getElementById("edit-prenom").value.trim();
            const email = document.getElementById("edit-email").value.trim();
            
            // Basic validation
            if (!nom || !prenom || !email) {
                displayErrorMessage("Tous les champs sont obligatoires");
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                displayErrorMessage("Format d'email invalide");
                return;
            }
            
            // All validation passed, update the account
            await updateStudent({
                id: selectedStudent.Id_Utilisateur,
                nom,
                prenom,
                email
            });
        }
    });

    document.getElementById("btn-chercher")?.addEventListener("click", () => openModal("Chercher un étudiant", "chercher"));
    document.getElementById("btn-supprimer")?.addEventListener("click", () => openModal("Supprimer un étudiant", "supprimer"));
    document.getElementById("btn-creer")?.addEventListener("click", () => openModal("Créer un étudiant", "creer"));
    document.getElementById("btn-modifier")?.addEventListener("click", () => openModal("Modifier un étudiant", "modifier"));
    document.querySelector(".close-btn")?.addEventListener("click", closeModal);

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    function ScrollHeight() {
        content.style.height = container.offsetHeight + "px";
    }

    window.onload = ScrollHeight;
    window.addEventListener("resize", ScrollHeight);
});
