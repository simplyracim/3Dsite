<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS');
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

// Vérifier les permissions
$role = $_SESSION['role'];
if ($role !== 'admin' && $role !== 'pilote') {
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
    
    // Si c'est une création d'entreprise
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($data['nom_entreprise']) || empty($data['nom_entreprise'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nom de l\'entreprise requis']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO entreprise (nom_entreprise, email, telephone, description) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['nom_entreprise'],
            $data['email'] ?? null,
            $data['telephone'] ?? null,
            $data['description'] ?? null
        ]);
        
        $id = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Entreprise créée avec succès',
            'id' => $id
        ]);
    }
    // Si c'est une mise à jour d'entreprise
    else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de l\'entreprise requis']);
            exit;
        }
        
        $id = $_GET['id'];
        
        // Vérifier si l'entreprise existe
        $stmt = $pdo->prepare("SELECT * FROM entreprise WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Entreprise non trouvée']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE entreprise SET nom_entreprise = ?, email = ?, telephone = ?, description = ? WHERE Id_Entreprise = ?");
        $stmt->execute([
            $data['nom_entreprise'],
            $data['email'] ?? null,
            $data['telephone'] ?? null,
            $data['description'] ?? null,
            $id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Entreprise mise à jour avec succès'
        ]);
    }
    // Si c'est une suppression d'entreprise
    else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de l\'entreprise requis']);
            exit;
        }
        
        $id = $_GET['id'];
        
        // Vérifier si l'entreprise existe
        $stmt = $pdo->prepare("SELECT * FROM entreprise WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Entreprise non trouvée']);
            exit;
        }
        
        // Supprimer d'abord les offres liées à cette entreprise
        $stmt = $pdo->prepare("DELETE FROM offre WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);
        
        // Supprimer l'entreprise
        $stmt = $pdo->prepare("DELETE FROM entreprise WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Entreprise supprimée avec succès'
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données: ' . $e->getMessage()]);
}
?> 