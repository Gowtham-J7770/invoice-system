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

$id = (int)$data['id'];

$user_id = (int)$data['user_id'];

//////////////////////////////////////////////////
// DELETE MAPPINGS
//////////////////////////////////////////////////

$conn->query("
    DELETE FROM supplier_products
    WHERE supplier_id = '$id'
");

//////////////////////////////////////////////////
// DELETE SUPPLIER
//////////////////////////////////////////////////

$conn->query("
    DELETE FROM suppliers
    WHERE id = '$id'
    AND user_id = '$user_id'
");

echo json_encode([
    "message" =>
    "Supplier deleted successfully"
]);

?>