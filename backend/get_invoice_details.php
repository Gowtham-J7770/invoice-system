<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = (int)($data['id'] ?? 0);
$user_id = (int)($data['user_id'] ?? 0);

if (!$id || !$user_id) {
    echo json_encode([
        "error" => "Invalid request"
    ]);
    exit();
}

//////////////////////////////////////////////////
// FETCH INVOICE
//////////////////////////////////////////////////

$invoiceQuery = $conn->query("
    SELECT
        invoices.*,
        clients.name AS client_name
    FROM invoices
    LEFT JOIN clients
        ON invoices.client_id = clients.id
    WHERE invoices.id = '$id'
      AND invoices.user_id = '$user_id'
");

if (!$invoiceQuery || $invoiceQuery->num_rows === 0) {
    echo json_encode([
        "error" => "Invoice not found"
    ]);
    exit();
}

$invoice = $invoiceQuery->fetch_assoc();

//////////////////////////////////////////////////
// FETCH ITEMS
//////////////////////////////////////////////////

$itemsResult = $conn->query("
    SELECT
        product_name,
        quantity,
        price,
        total
    FROM invoice_items
    WHERE invoice_id = '$id'
    ORDER BY id ASC
");

$items = [];

while ($row = $itemsResult->fetch_assoc()) {
    $items[] = $row;
}

//////////////////////////////////////////////////
// RESPONSE
//////////////////////////////////////////////////

echo json_encode([
    "invoice" => $invoice,
    "items" => $items
]);

?>