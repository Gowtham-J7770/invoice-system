<?php

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Headers: Content-Type");

header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

include "db.php";

//////////////////////////////////////////////////
// GET DATA
//////////////////////////////////////////////////

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$id =
    (int)($data['id'] ?? 0);

$user_id =
    (int)($data['user_id'] ?? 0);

$quantity =
    (float)($data['quantity'] ?? 0);

//////////////////////////////////////////////////
// VALIDATION
//////////////////////////////////////////////////

if (
    !$id ||
    !$user_id ||
    $quantity <= 0
) {

    echo json_encode([
        "error" =>
        "Invalid data"
    ]);

    exit();
}

//////////////////////////////////////////////////
// CHECK PRODUCT
//////////////////////////////////////////////////

$check =
    $conn->query("

        SELECT id

        FROM products

        WHERE id = '$id'

        AND user_id = '$user_id'

    ");

if (
    !$check ||
    $check->num_rows === 0
) {

    echo json_encode([
        "error" =>
        "Product not found"
    ]);

    exit();
}

//////////////////////////////////////////////////
// RESTOCK
//////////////////////////////////////////////////

$update =
    $conn->query("

        UPDATE products

        SET stock = stock + $quantity

        WHERE id = '$id'

        AND user_id = '$user_id'

    ");

if (!$update) {

    echo json_encode([
        "error" =>
        $conn->error
    ]);

    exit();
}

//////////////////////////////////////////////////
// SUCCESS
//////////////////////////////////////////////////

echo json_encode([
    "message" =>
    "Product restocked successfully"
]);

?>