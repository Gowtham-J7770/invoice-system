<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id = (int)($data['user_id'] ?? 0);
$client_id = (int)($data['client_id'] ?? 0);
$items = $data['items'] ?? [];
$total = (float)($data['total'] ?? 0);
$hasInventory = isset($data['hasInventory'])
    ? (bool)$data['hasInventory']
    : true;

//////////////////////////////////////////////////
// VALIDATION
//////////////////////////////////////////////////

if (!$user_id || !$client_id || empty($items) || $total <= 0) {
    echo json_encode([
        "error" => "Missing data"
    ]);
    exit();
}

//////////////////////////////////////////////////
// STEP 1 — STOCK VALIDATION
//////////////////////////////////////////////////

if ($hasInventory) {

    foreach ($items as $item) {

        $product_id = (int)($item['product_id'] ?? 0);
        $qty = (float)($item['quantity'] ?? 0);

        if (!$product_id || $qty <= 0) {
            echo json_encode([
                "error" => "Invalid invoice item"
            ]);
            exit();
        }

        $result = $conn->query("
            SELECT stock, name
            FROM products
            WHERE id = '$product_id'
              AND user_id = '$user_id'
        ");

        if (!$result || $result->num_rows === 0) {
            echo json_encode([
                "error" => "Product not found"
            ]);
            exit();
        }

        $row = $result->fetch_assoc();

        $currentStock = (float)$row['stock'];

        if ($qty > $currentStock) {
            echo json_encode([
                "error" =>
                    "Not enough stock for " .
                    $row['name']
            ]);
            exit();
        }
    }
}

//////////////////////////////////////////////////
// STEP 2 — CREATE INVOICE
//////////////////////////////////////////////////

$invoice_number = "INV-" . time();

$sql = "
    INSERT INTO invoices (
        user_id,
        client_id,
        invoice_number,
        subtotal,
        tax,
        total
    )
    VALUES (
        '$user_id',
        '$client_id',
        '$invoice_number',
        '$total',
        0,
        '$total'
    )
";

if (!$conn->query($sql)) {
    echo json_encode([
        "error" => $conn->error
    ]);
    exit();
}

$invoice_id = $conn->insert_id;

//////////////////////////////////////////////////
// STEP 3 — SAVE ITEMS + REDUCE STOCK
//////////////////////////////////////////////////

foreach ($items as $item) {

    $product_name = $conn->real_escape_string(
        $item['name']
    );

    $qty = (float)$item['quantity'];
    $price = (float)$item['price'];
    $item_total = (float)$item['total'];
    $product_id = (int)($item['product_id'] ?? 0);

    // SAVE ITEM
    $conn->query("
        INSERT INTO invoice_items (
            invoice_id,
            product_name,
            quantity,
            price,
            total
        )
        VALUES (
            '$invoice_id',
            '$product_name',
            '$qty',
            '$price',
            '$item_total'
        )
    ");

    //////////////////////////////////////////////////
    // REDUCE STOCK
    //////////////////////////////////////////////////

    if ($hasInventory && $product_id) {

        $conn->query("
            UPDATE products
            SET stock = stock - $qty
            WHERE id = '$product_id'
              AND user_id = '$user_id'
        ");
    }
}

echo json_encode([
    "message" => "Invoice saved successfully",
    "invoice_id" => $invoice_id,
    "invoice_number" => $invoice_number
]);

?>