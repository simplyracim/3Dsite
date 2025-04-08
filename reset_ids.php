<?php
function resetTableIds($pdo, $tableName, $idColumn, $relatedTables = []) {
    try {
        $pdo->beginTransaction();

        // 1. Récupérer tous les IDs actuels dans l'ordre
        $stmt = $pdo->query("SELECT $idColumn FROM $tableName ORDER BY $idColumn");
        $currentIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // 2. Pour chaque ID, mettre à jour avec son nouvel ID séquentiel
        foreach ($currentIds as $index => $oldId) {
            $newId = $index + 1;
            
            // Mettre à jour la table principale
            $stmt = $pdo->prepare("UPDATE $tableName SET $idColumn = ? WHERE $idColumn = ?");
            $stmt->execute([$newId, $oldId]);

            // Mettre à jour les tables liées
            foreach ($relatedTables as $relatedTable => $foreignKey) {
                $stmt = $pdo->prepare("UPDATE $relatedTable SET $foreignKey = ? WHERE $foreignKey = ?");
                $stmt->execute([$newId, $oldId]);
            }
        }

        // 3. Réinitialiser l'auto-increment à la prochaine valeur disponible
        $nextId = count($currentIds) + 1;
        $pdo->exec("ALTER TABLE $tableName AUTO_INCREMENT = $nextId");

        $pdo->commit();
        return ['success' => true];
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Erreur lors de la réinitialisation des IDs de $tableName: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
?> 