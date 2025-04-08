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

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode([
        'authenticated' => false,
        'message' => 'Non authentifié'
    ]);
    exit;
}

// Récupérer la page demandée
$page = isset($_GET['page']) ? $_GET['page'] : '';

// Définir les permissions pour chaque page
$permissions = [
    'offres' => [
        'search' => ['admin', 'pilote', 'etudiant', 'entreprise'],
        'create' => ['admin', 'pilote', 'entreprise'],
        'edit' => ['admin', 'pilote', 'entreprise'],
        'delete' => ['admin', 'pilote', 'entreprise'],
        'apply' => ['admin', 'etudiant'],
        'wishlist' => ['admin', 'etudiant']
    ],
    'entreprises' => [
        'search' => ['admin', 'pilote', 'etudiant'],
        'create' => ['admin', 'pilote'],
        'edit' => ['admin', 'pilote'],
        'delete' => ['admin', 'pilote']
    ],
    'pilote' => [
        'all' => ['admin']
    ],
    'etudiant' => [
        'all' => ['admin', 'pilote']
    ]
];

// Vérifier les permissions pour la page demandée
$userRole = $_SESSION['role'];
$hasPermission = false;

if (isset($permissions[$page])) {
    $pagePermissions = $permissions[$page];
    // L'admin a toujours tous les droits
    if ($userRole === 'admin') {
        $hasPermission = true;
    } else if (isset($pagePermissions['all'])) {
        $hasPermission = in_array($userRole, $pagePermissions['all']);
    } else {
        // Vérifier les permissions spécifiques pour chaque action
        $hasPermission = true;
        foreach ($pagePermissions as $action => $allowedRoles) {
            if (!in_array($userRole, $allowedRoles)) {
                $hasPermission = false;
                break;
            }
        }
    }
}

echo json_encode([
    'authenticated' => true,
    'role' => $userRole,
    'email' => $_SESSION['email'],
    'nom' => $_SESSION['nom'],
    'prenom' => $_SESSION['prenom'],
    'hasPermission' => $hasPermission,
    'permissions' => $permissions[$page] ?? null
]);
?> 