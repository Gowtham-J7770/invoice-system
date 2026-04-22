<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$name = $data['name'];
$price = $data['price'];
$hasInventory = $data['hasInventory'];

// 🔥 STOCK LOGIC
if (!$hasInventory) {
    $stock = NULL;
} else {
    if (!isset($data['stock']) || $data['stock'] === null || $data['stock'] === "") {
        $stock = 0;
    } else {
        $stock = (int)$data['stock'];
    }
}

// 🔥 HANDLE NULL PROPERLY
if ($stock === NULL) {
    $stockValue = "NULL";
} else {
    $stockValue = $stock;
}

// 🔥 UPDATE QUERY
$conn->query("UPDATE products 
SET name='$name', price='$price', stock=$stockValue 
WHERE id=$id");

echo json_encode(["message" => "Product updated"]);
?>