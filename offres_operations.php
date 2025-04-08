<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Gérer les requêtes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration de la base de données
$host = 'localhost';
$dbname = 'webdev';
$username = 'root';
$password = '';

// Désactiver l'affichage des erreurs PHP
error_reporting(0);
ini_set('display_errors', 0);

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données']);
    exit;
}

// Fonction pour récupérer les compétences
function getCompetences($pdo) {
    $stmt = $pdo->query("SELECT * FROM compétences ORDER BY nom_competences");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fonction pour récupérer les entreprises
function getEntreprises($pdo) {
    $stmt = $pdo->query("SELECT * FROM entreprise");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fonction pour récupérer les offres
function getOffres($pdo) {
    try {
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        
        $query = "SELECT o.*, e.nom_entreprise,
                 (SELECT GROUP_CONCAT(nom_competences SEPARATOR ', ')
                  FROM compétences c2
                  WHERE FIND_IN_SET(c2.Id_competences, o.competences) > 0) as competences_noms,
                 CASE WHEN w.Id_Wishlist IS NOT NULL THEN 1 ELSE 0 END as in_wishlist,
                 (SELECT COUNT(*) FROM candidature WHERE Id_Offre = o.Id_Offre) as nombre_candidatures,
                 CASE WHEN EXISTS (
                    SELECT 1 FROM candidature 
                    WHERE Id_Offre = o.Id_Offre 
                    AND Id_Utilisateur = :userId
                 ) THEN 1 ELSE 0 END as has_applied
                 FROM offre o
                 LEFT JOIN entreprise e ON o.Id_Entreprise = e.Id_Entreprise";
        
        if ($userId) {
            $query .= " LEFT JOIN wishlist w ON o.Id_Offre = w.Id_Offre AND w.Id_Utilisateur = :userId";
        }
        
        $query .= " GROUP BY o.Id_Offre, o.titre_offre, o.description_offre, o.remuneration, o.date_debut, o.date_fin, o.Id_Entreprise, e.nom_entreprise";
        
        $stmt = $pdo->prepare($query);
        if ($userId) {
            $stmt->bindParam(':userId', $userId);
        }
        $stmt->execute();
        
        $offres = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Récupérer la wishlist de l'utilisateur
        $wishlist = [];
        if ($userId) {
            $stmt = $pdo->prepare("SELECT Id_Offre FROM wishlist WHERE Id_Utilisateur = ?");
            $stmt->execute([$userId]);
            $wishlist = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }
        
        return ['offres' => $offres, 'wishlist' => $wishlist];
    } catch (PDOException $e) {
        error_log($e->getMessage());
        throw new Exception('Erreur lors de la récupération des offres');
    }
}

// Fonction pour créer une compétence
function createCompetence($pdo, $nom) {
    try {
        $stmt = $pdo->prepare("INSERT INTO compétences (nom_competences) VALUES (?)");
        $stmt->execute([$nom]);
        return ['success' => true, 'id' => $pdo->lastInsertId()];
    } catch (Exception $e) {
        throw $e;
    }
}

// Fonction pour créer une offre
function createOffre($pdo, $data) {
    try {
        // Convertir le tableau des compétences en chaîne de caractères
        $competences = implode(',', $data['competences']);

        // Insérer l'offre
        $stmt = $pdo->prepare("
            INSERT INTO offre (titre_offre, description_offre, remuneration, date_debut, date_fin, Id_Entreprise, competences)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['titre'],
            $data['description'],
            $data['remuneration'],
            $data['date_debut'],
            $data['date_fin'],
            $data['Id_Entreprise'],
            $competences
        ]);
        
        return ['success' => true, 'id' => $pdo->lastInsertId()];
    } catch (Exception $e) {
        throw $e;
    }
}

// Fonction pour mettre à jour une offre
function updateOffre($pdo, $data) {
    try {
        // Convertir le tableau des compétences en chaîne de caractères
        $competences = implode(',', $data['competences']);

        // Mettre à jour l'offre
        $stmt = $pdo->prepare("
            UPDATE offre 
            SET titre_offre = ?, description_offre = ?, remuneration = ?, 
                date_debut = ?, date_fin = ?, Id_Entreprise = ?, competences = ?
            WHERE Id_Offre = ?
        ");
        $stmt->execute([
            $data['titre'],
            $data['description'],
            $data['remuneration'],
            $data['date_debut'],
            $data['date_fin'],
            $data['Id_Entreprise'],
            $competences,
            $data['Id_Offre']
        ]);

        return ['success' => true];
    } catch (Exception $e) {
        throw $e;
    }
}

// Fonction pour supprimer une offre
function deleteOffre($pdo, $id) {
    try {
        // Démarrer une nouvelle transaction
        $pdo->beginTransaction();

        // 1. Supprimer d'abord les entrées dans la table wishlist
        $stmt = $pdo->prepare("DELETE FROM wishlist WHERE Id_Offre = ?");
        $stmt->execute([$id]);

        // 2. Supprimer les entrées dans la table offre_competences
        $stmt = $pdo->prepare("DELETE FROM offre_competences WHERE Id_Offre = ?");
        $stmt->execute([$id]);

        // 3. Supprimer l'offre elle-même
        $stmt = $pdo->prepare("DELETE FROM offre WHERE Id_Offre = ?");
        $stmt->execute([$id]);

        // Valider la transaction
        $pdo->commit();

        // 4. Réinitialiser les IDs des tables liées (en dehors de la transaction)
        $relatedTables = [
            'wishlist' => 'Id_Offre',
            'offre_competences' => 'Id_Offre'
        ];
        
        // Récupérer tous les IDs actuels dans l'ordre
        $stmt = $pdo->query("SELECT Id_Offre FROM offre ORDER BY Id_Offre");
        $currentIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Pour chaque ID, mettre à jour avec son nouvel ID séquentiel
        foreach ($currentIds as $index => $oldId) {
            $newId = $index + 1;
            
            // Mettre à jour la table principale
            $stmt = $pdo->prepare("UPDATE offre SET Id_Offre = ? WHERE Id_Offre = ?");
            $stmt->execute([$newId, $oldId]);

            // Mettre à jour les tables liées
            foreach ($relatedTables as $relatedTable => $foreignKey) {
                $stmt = $pdo->prepare("UPDATE $relatedTable SET $foreignKey = ? WHERE $foreignKey = ?");
                $stmt->execute([$newId, $oldId]);
            }
        }

        // Réinitialiser l'auto-increment à la prochaine valeur disponible
        $nextId = count($currentIds) + 1;
        $pdo->exec("ALTER TABLE offre AUTO_INCREMENT = $nextId");
        
        return ['success' => true, 'message' => 'Offre supprimée avec succès'];
    } catch (Exception $e) {
        // En cas d'erreur, annuler la transaction
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Erreur lors de la suppression de l'offre: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Fonction pour obtenir les statistiques
function getStatistiques($pdo) {
    // Répartition par compétence
    $stmt = $pdo->query("
        SELECT c.nom_competences, COUNT(oc.Id_Offre) as nombre_offres
        FROM compétences c
        LEFT JOIN offre_competences oc ON c.Id_competences = oc.Id_competences
        GROUP BY c.Id_competences
    ");
    $competences = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Répartition par durée
    $stmt = $pdo->query("
        SELECT 
            CASE 
                WHEN DATEDIFF(date_fin, date_debut) <= 30 THEN '1 mois'
                WHEN DATEDIFF(date_fin, date_debut) <= 60 THEN '2 mois'
                WHEN DATEDIFF(date_fin, date_debut) <= 90 THEN '3 mois'
                ELSE 'Plus de 3 mois'
            END as duree,
            COUNT(*) as nombre_offres
        FROM offre
        GROUP BY duree
    ");
    $durees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Top des offres en wishlist
    $stmt = $pdo->query("
        SELECT o.titre_offre, COUNT(w.Id_Wishlist) as nombre_wishlist
        FROM offre o
        LEFT JOIN wishlist w ON o.Id_Offre = w.Id_Offre
        GROUP BY o.Id_Offre
        ORDER BY nombre_wishlist DESC
        LIMIT 5
    ");
    $wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        'competences' => $competences,
        'durees' => $durees,
        'wishlist' => $wishlist
    ];
}

// Fonction pour soumettre une candidature
function submitCandidature($pdo, $data) {
    try {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'error' => 'Utilisateur non connecté'];
        }

        $userId = $_SESSION['user_id'];
        $offerId = $data['Id_Offre'];
        $lettreMotivation = $data['lettre_motivation'];
        $cvPath = null;

        // Vérifier si l'utilisateur n'a pas déjà postulé
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM candidature WHERE Id_Utilisateur = ? AND Id_Offre = ?");
        $stmt->execute([$userId, $offerId]);
        if ($stmt->fetchColumn() > 0) {
            return ['success' => false, 'error' => 'Vous avez déjà postulé à cette offre'];
        }

        // Gestion de l'upload du CV
        if (isset($_FILES['cv']) && $_FILES['cv']['error'] == 0) {
            // Vérifier le type de fichier (PDF uniquement)
            $allowedTypes = ['application/pdf'];
            $fileType = $_FILES['cv']['type'];
            
            if (!in_array($fileType, $allowedTypes)) {
                return ['success' => false, 'error' => 'Seuls les fichiers PDF sont acceptés'];
            }
            
            // Vérifier la taille du fichier (5MB max)
            $maxSize = 5 * 1024 * 1024; // 5MB en octets
            if ($_FILES['cv']['size'] > $maxSize) {
                return ['success' => false, 'error' => 'Le fichier est trop volumineux (5MB maximum)'];
            }
            
            // Créer le dossier de destination s'il n'existe pas
            $uploadDir = 'uploads/cv/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            // Générer un nom de fichier unique
            $fileName = $userId . '_' . $offerId . '_' . time() . '.pdf';
            $targetPath = $uploadDir . $fileName;
            
            // Déplacer le fichier
            if (move_uploaded_file($_FILES['cv']['tmp_name'], $targetPath)) {
                $cvPath = $targetPath;
            } else {
                return ['success' => false, 'error' => 'Erreur lors de l\'upload du CV'];
            }
        } else {
            return ['success' => false, 'error' => 'Le CV est obligatoire'];
        }

        // Insérer la candidature avec le chemin du CV
        $stmt = $pdo->prepare("INSERT INTO candidature (date_candidature, lettre_motivation, cv_path, Id_Offre, Id_Utilisateur) VALUES (NOW(), ?, ?, ?, ?)");
        $stmt->execute([$lettreMotivation, $cvPath, $offerId, $userId]);

        return ['success' => true, 'message' => 'Candidature enregistrée avec succès'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Fonction pour obtenir les candidatures de l'utilisateur
function getMyApplications($pdo) {
    try {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'error' => 'Utilisateur non connecté'];
        }

        $userId = $_SESSION['user_id'];
        
        $query = "SELECT c.*, o.titre_offre, e.nom_entreprise 
                 FROM candidature c 
                 JOIN offre o ON c.Id_Offre = o.Id_Offre 
                 JOIN entreprise e ON o.Id_Entreprise = e.Id_Entreprise 
                 WHERE c.Id_Utilisateur = ? 
                 ORDER BY c.date_candidature DESC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$userId]);
        
        $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return ['success' => true, 'applications' => $applications];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function deleteApplication($pdo) {
    if (!isset($_SESSION['user_id'])) {
        return ['success' => false, 'message' => 'Utilisateur non connecté'];
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['candidatureId'])) {
        return ['success' => false, 'message' => 'ID de candidature manquant'];
    }

    try {
        $pdo->beginTransaction();

        // Récupérer le chemin du CV avant suppression
        $stmt = $pdo->prepare("SELECT cv_path FROM candidature WHERE Id_Candidature = ? AND Id_Utilisateur = ?");
        $stmt->execute([$data['candidatureId'], $_SESSION['user_id']]);
        $cvPath = $stmt->fetchColumn();

        // 1. Désactiver temporairement les contraintes de clé étrangère
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Supprimer la candidature
        $stmt = $pdo->prepare("DELETE FROM candidature WHERE Id_Candidature = ? AND Id_Utilisateur = ?");
        $stmt->execute([$data['candidatureId'], $_SESSION['user_id']]);
        
        if ($stmt->rowCount() > 0) {
            // Supprimer le fichier CV s'il existe
            if ($cvPath && file_exists($cvPath)) {
                unlink($cvPath);
            }
            
            // 3. Sauvegarder les données existantes
            $stmt = $pdo->query("SELECT * FROM candidature ORDER BY Id_Candidature");
            $candidatures = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // 4. Vider la table
            $pdo->exec("TRUNCATE TABLE candidature");
            
            // 5. Réinsérer les données avec de nouveaux IDs
            $newId = 1;
            foreach ($candidatures as $candidature) {
                $stmt = $pdo->prepare("INSERT INTO candidature (Id_Candidature, date_candidature, lettre_motivation, cv_path, Id_Offre, Id_Utilisateur) 
                                     VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $newId,
                    $candidature['date_candidature'],
                    $candidature['lettre_motivation'],
                    $candidature['cv_path'],
                    $candidature['Id_Offre'],
                    $candidature['Id_Utilisateur']
                ]);
                $newId++;
            }

            // 6. Réinitialiser l'auto-increment
            $pdo->exec("ALTER TABLE candidature AUTO_INCREMENT = $newId");

            // 7. Réactiver les contraintes de clé étrangère
            $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

            $pdo->commit();
            return ['success' => true, 'message' => 'Candidature supprimée avec succès'];
        } else {
            $pdo->rollBack();
            $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
            return ['success' => false, 'message' => 'Candidature non trouvée ou non autorisée'];
        }
    } catch(PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
        error_log("Erreur lors de la suppression de la candidature: " . $e->getMessage());
        return ['success' => false, 'message' => 'Erreur lors de la suppression de la candidature'];
    }
}

function checkAuthAndPermissions($pdo, $requiredRole = null) {
    if (!isset($_SESSION['user_id'])) {
        return ['success' => false, 'error' => 'Vous devez être connecté pour effectuer cette action'];
    }

    // Récupérer le rôle de l'utilisateur
    $stmt = $pdo->prepare("SELECT role FROM utilisateur WHERE Id_Utilisateur = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $userRole = $stmt->fetchColumn();

    // L'admin a toujours tous les droits
    if ($userRole === 'admin') {
        return ['success' => true, 'role' => $userRole];
    }

    // Pour les actions qui nécessitent spécifiquement le rôle étudiant
    if ($requiredRole === 'etudiant' && $userRole !== 'etudiant') {
        return ['success' => false, 'error' => 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action'];
    }

    // Pour les actions qui nécessitent le rôle entreprise ou pilote
    if ($requiredRole === 'entreprise' && $userRole !== 'entreprise' && $userRole !== 'pilote') {
        return ['success' => false, 'error' => 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action'];
    }

    return ['success' => true, 'role' => $userRole];
}

// Fonction pour ajouter une offre à la wishlist
function addToWishlist($pdo, $offerId) {
    try {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'error' => 'Utilisateur non connecté'];
        }

        $userId = $_SESSION['user_id'];
        
        // Vérifier si l'offre n'est pas déjà dans la wishlist
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM wishlist WHERE Id_Utilisateur = ? AND Id_Offre = ?");
        $stmt->execute([$userId, $offerId]);
        if ($stmt->fetchColumn() > 0) {
            return ['success' => false, 'error' => 'Cette offre est déjà dans votre wishlist'];
        }
        
        // Ajouter l'offre à la wishlist
        $stmt = $pdo->prepare("INSERT INTO wishlist (Id_Utilisateur, Id_Offre) VALUES (?, ?)");
        $stmt->execute([$userId, $offerId]);
        
        return ['success' => true, 'message' => 'Offre ajoutée à votre wishlist'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Fonction pour retirer une offre de la wishlist
function removeFromWishlist($pdo, $offerId) {
    try {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'error' => 'Utilisateur non connecté'];
        }

        $userId = $_SESSION['user_id'];
        
        // Supprimer l'entrée de la wishlist
        $stmt = $pdo->prepare("DELETE FROM wishlist WHERE Id_Utilisateur = ? AND Id_Offre = ?");
        $stmt->execute([$userId, $offerId]);
        
        if ($stmt->rowCount() === 0) {
            return ['success' => false, 'error' => 'Cette offre n\'est pas dans votre wishlist'];
        }
        
        // Récupérer tous les IDs actuels dans l'ordre
        $stmt = $pdo->query("SELECT Id_Wishlist FROM wishlist ORDER BY Id_Wishlist");
        $currentIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Pour chaque ID, mettre à jour avec son nouvel ID séquentiel
        foreach ($currentIds as $index => $oldId) {
            $newId = $index + 1;
            $stmt = $pdo->prepare("UPDATE wishlist SET Id_Wishlist = ? WHERE Id_Wishlist = ?");
            $stmt->execute([$newId, $oldId]);
        }

        // Réinitialiser l'auto-increment à la prochaine valeur disponible
        $nextId = count($currentIds) + 1;
        $pdo->exec("ALTER TABLE wishlist AUTO_INCREMENT = $nextId");
        
        return ['success' => true, 'message' => 'Offre retirée de votre wishlist'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Gestion des requêtes
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['action'])) {
                switch ($_GET['action']) {
                    case 'competences':
                        echo json_encode(getCompetences($pdo));
                        break;
                    case 'entreprises':
                        echo json_encode(getEntreprises($pdo));
                        break;
                    case 'offres':
                        echo json_encode(getOffres($pdo));
                        break;
                    case 'statistiques':
                        echo json_encode(getStatistiques($pdo));
                        break;
                    case 'myApplications':
                        echo json_encode(getMyApplications($pdo));
                        break;
                    default:
                        http_response_code(400);
                        echo json_encode(['error' => 'Action non valide']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Action non spécifiée']);
            }
            break;

        case 'POST':
            // Vérifier si c'est un formulaire multipart avec fichier
            if (isset($_POST['action']) && $_POST['action'] === 'submitCandidature') {
                // Traitement de l'upload de fichier pour candidature
                $result = submitCandidature($pdo, $_POST);
                echo json_encode($result);
            } else {
                // Traitement des autres requêtes JSON standard
                $data = json_decode(file_get_contents('php://input'), true);
                if (isset($data['action'])) {
                    switch ($data['action']) {
                        case 'createCompetence':
                            $result = createCompetence($pdo, $data['nom']);
                            break;
                            
                        case 'addToWishlist':
                            $permissionCheck = checkAuthAndPermissions($pdo, 'etudiant');
                            if (!$permissionCheck['success']) {
                                $result = $permissionCheck;
                                break;
                            }
                            $result = addToWishlist($pdo, $data['Id_Offre']);
                            break;
                            
                        case 'removeFromWishlist':
                            $result = removeFromWishlist($pdo, $data['Id_Offre']);
                            break;
                            
                        case 'createOffre':
                            $permissionCheck = checkAuthAndPermissions($pdo, 'entreprise');
                            if (!$permissionCheck['success']) {
                                $result = $permissionCheck;
                                break;
                            }
                            $result = createOffre($pdo, $data);
                            break;
                            
                        case 'updateOffre':
                            $permissionCheck = checkAuthAndPermissions($pdo, 'entreprise');
                            if (!$permissionCheck['success']) {
                                $result = $permissionCheck;
                                break;
                            }
                            $result = updateOffre($pdo, $data);
                            break;
                            
                        case 'deleteOffre':
                            $permissionCheck = checkAuthAndPermissions($pdo, 'entreprise');
                            if (!$permissionCheck['success']) {
                                $result = $permissionCheck;
                                break;
                            }
                            $result = deleteOffre($pdo, $data['Id_Offre']);
                            break;
                            
                        case 'deleteApplication':
                            $result = deleteApplication($pdo);
                            break;
                            
                        default:
                            $result = ['success' => false, 'error' => 'Action non valide'];
                    }
                    
                    echo json_encode($result);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Action non spécifiée']);
                }
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 