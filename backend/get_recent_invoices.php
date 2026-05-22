<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

$user_id = (int)($_GET['user_id'] ?? 0);

if (!$user_id) {
    echo json_encode([]);
    exit();
}

$result = $conn->query("
    SELECT
        invoices.id,
        invoices.invoice_number,
        invoices.total,
        invoices.created_at,
        clients.name AS client_name
    FROM invoices
    LEFT JOIN clients
        ON invoices.client_id = clients.id
    WHERE invoices.user_id = '$user_id'
    ORDER BY invoices.id DESC
    LIMIT 10
");

$invoices = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {

        $row['client_name'] =
            $row['client_name'] ?: 'Unknown Client';

        $invoices[] = $row;
    }
}

echo json_encode($invoices);

?>