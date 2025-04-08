<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'webdev';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle create student request
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    // Validate input
    $requiredFields = ['nom', 'prenom', 'email', 'password'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields: ' . implode(', ', $missingFields)
        ]);
        exit;
    }
    
    $nom = $_POST['nom'];
    $prenom = $_POST['prenom'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Format d\'email invalide'
        ]);
        exit;
    }
    
    // Validate password (min 8 chars, at least one uppercase, one lowercase, one number)
    if (strlen($password) < 8 || 
        !preg_match('/[A-Z]/', $password) || 
        !preg_match('/[a-z]/', $password) || 
        !preg_match('/[0-9]/', $password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
        ]);
        exit;
    }
    
    try {
        // Check if email already exists
        $checkQuery = "SELECT email FROM utilisateur WHERE email = :email";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(409); // Conflict
            echo json_encode([
                'success' => false,
                'error' => 'Un compte avec cet email existe déjà'
            ]);
            exit;
        }
        
        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert the new student
        $query = "INSERT INTO utilisateur (nom_utilisateur, prenom, email, password, role) 
                 VALUES (:nom, :prenom, :email, :password, 'etudiant')";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':nom', $nom, PDO::PARAM_STR);
        $stmt->bindParam(':prenom', $prenom, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Compte étudiant créé avec succès'
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error creating student account: ' . $e->getMessage()
        ]);
    }
}
// Handle update student request
elseif ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update') {
    // Validate input
    $requiredFields = ['id', 'nom', 'prenom', 'email'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields: ' . implode(', ', $missingFields)
        ]);
        exit;
    }
    
    $id = $_POST['id'];
    $nom = $_POST['nom'];
    $prenom = $_POST['prenom'];
    $email = $_POST['email'];
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Format d\'email invalide'
        ]);
        exit;
    }
    
    try {
        // Check if the student exists
        $checkQuery = "SELECT Id_Utilisateur FROM utilisateur WHERE Id_Utilisateur = :id AND role = 'etudiant'";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Étudiant non trouvé'
            ]);
            exit;
        }
        
        // Check if new email already exists for another user
        $emailCheckQuery = "SELECT Id_Utilisateur FROM utilisateur WHERE email = :email AND Id_Utilisateur != :id";
        $emailCheckStmt = $pdo->prepare($emailCheckQuery);
        $emailCheckStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $emailCheckStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $emailCheckStmt->execute();
        
        if ($emailCheckStmt->rowCount() > 0) {
            http_response_code(409); // Conflict
            echo json_encode([
                'success' => false,
                'error' => 'Cet email est déjà utilisé par un autre compte'
            ]);
            exit;
        }
        
        // Update the student
        $updateQuery = "UPDATE utilisateur 
                       SET nom_utilisateur = :nom, prenom = :prenom, email = :email 
                       WHERE Id_Utilisateur = :id AND role = 'etudiant'";
        
        $updateStmt = $pdo->prepare($updateQuery);
        $updateStmt->bindParam(':nom', $nom, PDO::PARAM_STR);
        $updateStmt->bindParam(':prenom', $prenom, PDO::PARAM_STR);
        $updateStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $updateStmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Compte étudiant mis à jour avec succès'
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error updating student account: ' . $e->getMessage()
        ]);
    }
}
// Handle delete student request
elseif ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    // Validate input
    if (!isset($_POST['id']) || empty($_POST['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'ID de l\'étudiant requis'
        ]);
        exit;
    }
    
    $id = $_POST['id'];
    
    try {
        // Check if the student exists
        $checkQuery = "SELECT Id_Utilisateur FROM utilisateur WHERE Id_Utilisateur = :id AND role = 'etudiant'";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Étudiant non trouvé'
            ]);
            exit;
        }
        
        // Delete the student
        $deleteQuery = "DELETE FROM utilisateur WHERE Id_Utilisateur = :id AND role = 'etudiant'";
        $deleteStmt = $pdo->prepare($deleteQuery);
        $deleteStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $deleteStmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Compte étudiant supprimé avec succès'
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error deleting student account: ' . $e->getMessage()
        ]);
    }
}
// Handle search student request
elseif ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'search') {
    $searchTerm = isset($_GET['term']) ? '%' . $_GET['term'] . '%' : '';
    
    try {
        $query = "SELECT Id_Utilisateur, nom_utilisateur, prenom, email 
                 FROM utilisateur 
                 WHERE role = 'etudiant' 
                 AND (nom_utilisateur LIKE :term 
                 OR prenom LIKE :term 
                 OR email LIKE :term)";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':term', $searchTerm, PDO::PARAM_STR);
        $stmt->execute();
        
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // For each student, get their internship applications
        foreach ($students as &$student) {
            $internshipQuery = "SELECT o.titre_offre, o.description_offre, e.nom_entreprise, c.date_candidature, c.Id_Candidature 
                                FROM candidature c 
                                JOIN offre o ON c.Id_Offre = o.Id_Offre 
                                JOIN entreprise e ON o.Id_Entreprise = e.Id_Entreprise 
                                WHERE c.Id_Utilisateur = :userId";
            
            $internshipStmt = $pdo->prepare($internshipQuery);
            $internshipStmt->bindParam(':userId', $student['Id_Utilisateur'], PDO::PARAM_INT);
            $internshipStmt->execute();
            
            $internships = $internshipStmt->fetchAll(PDO::FETCH_ASSOC);
            $student['internships'] = $internships;
            $student['internship_count'] = count($internships);
            
            // Remove ID from response
            unset($student['Id_Utilisateur']);
        }
        
        echo json_encode([
            'success' => true,
            'data' => $students
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error searching students: ' . $e->getMessage()
        ]);
    }
} 
// Handle list students request with pagination
elseif ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'list') {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
    $offset = ($page - 1) * $limit;
    
    try {
        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) as total FROM utilisateur WHERE role = 'etudiant'";
        $countStmt = $pdo->query($countQuery);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get paginated student list
        $query = "SELECT Id_Utilisateur, nom_utilisateur, prenom, email 
                 FROM utilisateur 
                 WHERE role = 'etudiant'
                 ORDER BY nom_utilisateur ASC
                 LIMIT :limit OFFSET :offset";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // For each student, get the count of internship applications
        foreach ($students as &$student) {
            $internshipQuery = "SELECT COUNT(*) as count FROM candidature WHERE Id_Utilisateur = :userId";
            
            $internshipStmt = $pdo->prepare($internshipQuery);
            $internshipStmt->bindParam(':userId', $student['Id_Utilisateur'], PDO::PARAM_INT);
            $internshipStmt->execute();
            
            $internshipCount = $internshipStmt->fetch(PDO::FETCH_ASSOC)['count'];
            $student['internship_count'] = $internshipCount;
        }
        
        $totalPages = ceil($totalCount / $limit);
        
        echo json_encode([
            'success' => true,
            'data' => $students,
            'pagination' => [
                'total' => $totalCount,
                'per_page' => $limit,
                'current_page' => $page,
                'total_pages' => $totalPages
            ]
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error listing students: ' . $e->getMessage()
        ]);
    }
}
// Get student by ID
elseif ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get') {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'ID de l\'étudiant requis'
        ]);
        exit;
    }
    
    $id = $_GET['id'];
    
    try {
        $query = "SELECT Id_Utilisateur, nom_utilisateur, prenom, email 
                 FROM utilisateur 
                 WHERE Id_Utilisateur = :id AND role = 'etudiant'";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$student) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Étudiant non trouvé'
            ]);
            exit;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $student
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error getting student: ' . $e->getMessage()
        ]);
    }
}
// Get internship details for a specific student
elseif ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'internships') {
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Email is required'
        ]);
        exit;
    }
    
    try {
        // First get the student ID
        $userQuery = "SELECT Id_Utilisateur FROM utilisateur WHERE email = :email AND role = 'etudiant'";
        $userStmt = $pdo->prepare($userQuery);
        $userStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $userStmt->execute();
        
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Student not found'
            ]);
            exit;
        }
        
        $userId = $user['Id_Utilisateur'];
        
        // Get internship applications
        $internshipQuery = "SELECT o.titre_offre, o.description_offre, e.nom_entreprise, c.date_candidature 
                          FROM candidature c 
                          JOIN offre o ON c.Id_Offre = o.Id_Offre 
                          JOIN entreprise e ON o.Id_Entreprise = e.Id_Entreprise 
                          WHERE c.Id_Utilisateur = :userId";
        
        $internshipStmt = $pdo->prepare($internshipQuery);
        $internshipStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $internshipStmt->execute();
        
        $internships = $internshipStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $internships
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error getting internships: ' . $e->getMessage()
        ]);
    }
} 