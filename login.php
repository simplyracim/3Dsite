<?php
// Configuration initiale de la session
ini_set('session.cookie_lifetime', 86400); // 24 heures
ini_set('session.gc_maxlifetime', 86400); // 24 heures
session_start();

// Autoriser l'accès depuis votre domaine local
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Activer les logs d'erreur
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Gérer les requêtes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION = array();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Déconnexion réussie']);
    exit;
}

// Database connection
$host = 'localhost';
$dbname = 'webdev';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get JSON data
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    if (!$data) {
        error_log('Données JSON invalides: ' . $json);
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides']);
        exit;
    }

    if (empty($data->email) || empty($data->password)) {
        error_log('Email ou mot de passe manquant');
        http_response_code(400);
        echo json_encode(['error' => 'Email et mot de passe requis']);
        exit;
    }

    $email = $data->email;
    $password = $data->password;

    error_log('Tentative de connexion pour: ' . $email);

    // Vérification avec email et mot de passe haché
    $stmt = $pdo->prepare("SELECT Id_Utilisateur, nom_utilisateur, prenom, email, password, role FROM utilisateur WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        error_log('Connexion réussie pour: ' . $email);
        // Set session variables
        $_SESSION['user_id'] = $user['Id_Utilisateur'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['nom'] = $user['nom_utilisateur'];
        $_SESSION['prenom'] = $user['prenom'];

        echo json_encode([
            'success' => true,
            'role' => $user['role'],
            'email' => $user['email']
        ]);
    } else {
        error_log('Échec de connexion pour: ' . $email);
        http_response_code(401);
        echo json_encode(['error' => 'Email ou mot de passe incorrect']);
    }
} catch(PDOException $e) {
    error_log('Erreur PDO: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données']);
}
?> 