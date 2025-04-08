<?php
require_once 'db_connect.php';
require_once 'reset_ids.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function deleteEntreprise($pdo, $id) {
    try {
        $pdo->beginTransaction();

        // 1. Supprimer les évaluations
        $stmt = $pdo->prepare("DELETE FROM eval_entreprise WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);

        // 2. Supprimer les offres liées (qui supprimera aussi les entrées dans wishlist et offre_competences)
        $stmt = $pdo->prepare("SELECT Id_Offre FROM offre WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);
        $offres = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($offres as $offreId) {
            $stmt = $pdo->prepare("DELETE FROM wishlist WHERE Id_Offre = ?");
            $stmt->execute([$offreId]);
            
            $stmt = $pdo->prepare("DELETE FROM offre_competences WHERE Id_Offre = ?");
            $stmt->execute([$offreId]);
        }

        $stmt = $pdo->prepare("DELETE FROM offre WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);

        // 3. Supprimer l'entreprise
        $stmt = $pdo->prepare("DELETE FROM entreprise WHERE Id_Entreprise = ?");
        $stmt->execute([$id]);

        // 4. Réinitialiser les IDs des tables
        $relatedTables = [
            'eval_entreprise' => 'Id_Entreprise',
            'offre' => 'Id_Entreprise'
        ];
        $result = resetTableIds($pdo, 'entreprise', 'Id_Entreprise', $relatedTables);

        if (!$result['success']) {
            throw new Exception($result['error']);
        }

        // Réinitialiser aussi les IDs des offres
        $offreRelatedTables = [
            'wishlist' => 'Id_Offre',
            'offre_competences' => 'Id_Offre'
        ];
        $result = resetTableIds($pdo, 'offre', 'Id_Offre', $offreRelatedTables);

        if (!$result['success']) {
            throw new Exception($result['error']);
        }

        $pdo->commit();
        return ['success' => true];
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Erreur lors de la suppression de l'entreprise: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Gérer la requête DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID manquant']);
        exit;
    }

    try {
        $result = deleteEntreprise($pdo, $id);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?> 