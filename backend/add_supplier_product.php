<?php

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Headers: Content-Type");

header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "db.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$supplier_id =
(int)$data['supplier_id'];

$product_id =
(int)$data['product_id'];

//////////////////////////////////////////////////
// DUPLICATE CHECK
//////////////////////////////////////////////////

$check = $conn->query("
    SELECT id
    FROM supplier_products
    WHERE supplier_id =
          '$supplier_id'
    AND product_id =
        '$product_id'
");

if ($check->num_rows > 0) {

    echo json_encode([
        "error" =>
        "Product already added"
    ]);

    exit();
}

//////////////////////////////////////////////////
// INSERT
//////////////////////////////////////////////////

$conn->query("
    INSERT INTO supplier_products (
        supplier_id,
        product_id
    )
    VALUES (
        '$supplier_id',
        '$product_id'
    )
");

echo json_encode([
    "message" =>
    "Product added to supplier"
]);

?>