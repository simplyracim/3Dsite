<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Gérer les requêtes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non authentifié']);
    exit;
}

// Vérifier les permissions (seulement les étudiants et admins peuvent évaluer)
$role = $_SESSION['role'];
if ($role !== 'etudiant' && $role !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permissions insuffisantes']);
    exit;
}

// Configuration de la base de données
$host = 'localhost';
$dbname = 'webdev';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Récupérer les données JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!isset($data['id_entreprise']) || !isset($data['note'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        exit;
    }
    
    $idEntreprise = $data['id_entreprise'];
    $note = floatval($data['note']);
    $userId = $_SESSION['user_id'];
    
    // Valider la note (entre 0 et 5)
    if ($note < 0 || $note > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La note doit être comprise entre 0 et 5']);
        exit;
    }
    
    // Vérifier si l'entreprise existe
    $stmt = $pdo->prepare("SELECT * FROM entreprise WHERE Id_Entreprise = ?");
    $stmt->execute([$idEntreprise]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Entreprise non trouvée']);
        exit;
    }
    
    // Vérifier si l'utilisateur a déjà évalué cette entreprise
    $stmt = $pdo->prepare("SELECT * FROM eval_entreprise WHERE Id_Utilisateur = ? AND Id_Entreprise = ?");
    $stmt->execute([$userId, $idEntreprise]);
    
    // Ajouter ou mettre à jour l'évaluation
    $pdo->beginTransaction();
    
    if ($stmt->rowCount() > 0) {
        // Mettre à jour l'évaluation existante
        $stmt = $pdo->prepare("UPDATE eval_entreprise SET note = ? WHERE Id_Utilisateur = ? AND Id_Entreprise = ?");
        $stmt->execute([$note, $userId, $idEntreprise]);
    } else {
        // Ajouter une nouvelle évaluation
        $stmt = $pdo->prepare("INSERT INTO eval_entreprise (Id_Utilisateur, Id_Entreprise, note) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $idEntreprise, $note]);
    }
    
    // Mettre à jour la moyenne des évaluations de l'entreprise
    $stmt = $pdo->prepare("SELECT AVG(note) as moyenne FROM eval_entreprise WHERE Id_Entreprise = ?");
    $stmt->execute([$idEntreprise]);
    $moyenne = $stmt->fetch(PDO::FETCH_ASSOC)['moyenne'];
    
    // Arrondir à 2 décimales
    $moyenne = round($moyenne, 2);
    
    // Mettre à jour la moyenne dans la table entreprise
    $stmt = $pdo->prepare("UPDATE entreprise SET moyenne_evaluation = ? WHERE Id_Entreprise = ?");
    $stmt->execute([$moyenne, $idEntreprise]);
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Évaluation enregistrée avec succès',
        'moyenne' => $moyenne
    ]);
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données: ' . $e->getMessage()]);
}
?> 