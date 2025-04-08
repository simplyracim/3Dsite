<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non connecté']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $userId = $_SESSION['user_id'];
    
    // Récupérer les informations de l'utilisateur
    $stmt = $pdo->prepare("SELECT Id_Utilisateur, nom_utilisateur, prenom, email, role FROM utilisateur WHERE Id_Utilisateur = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé']);
        exit;
    }
    
    // Récupérer les éléments de la wishlist de l'utilisateur avec les détails des offres
    $stmt = $pdo->prepare("
        SELECT w.Id_Wishlist, o.Id_Offre, o.titre_offre, o.description_offre, 
               o.remuneration, o.date_debut, o.date_fin, e.nom_entreprise,
               (SELECT GROUP_CONCAT(nom_competences SEPARATOR ', ')
                FROM compétences c
                WHERE FIND_IN_SET(c.Id_competences, o.competences) > 0) as competences_noms
        FROM wishlist w
        JOIN offre o ON w.Id_Offre = o.Id_Offre
        JOIN entreprise e ON o.Id_Entreprise = e.Id_Entreprise
        WHERE w.Id_Utilisateur = ?
        ORDER BY w.Id_Wishlist DESC
    ");
    $stmt->execute([$userId]);
    $wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Récupérer le nombre total d'éléments dans la wishlist
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM wishlist WHERE Id_Utilisateur = ?");
    $stmt->execute([$userId]);
    $totalItems = $stmt->fetchColumn();
    
    // Construire la réponse
    $response = [
        'success' => true,
        'user' => $user,
        'wishlist' => $wishlist,
        'totalItems' => $totalItems
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données: ' . $e->getMessage()]);
}
?> 