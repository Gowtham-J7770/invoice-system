<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$price = $data['price'];
$hasInventory = $data['hasInventory'];

// 🔥 STOCK LOGIC
if (!$hasInventory) {
    $stock = NULL;
} else {
    if (!isset($data['stock']) || $data['stock'] === null || $data['stock'] === "") {
        $stock = 0; // empty means out of stock
    } else {
        $stock = (int)$data['stock'];
    }
}

// 🔥 HANDLE NULL PROPERLY (IMPORTANT 💀)
if ($stock === NULL) {
    $stockValue = "NULL"; // no quotes
} else {
    $stockValue = $stock;
}

// 🔥 INSERT QUERY
$conn->query("INSERT INTO products (user_id, name, price, stock)
VALUES (1, '$name', '$price', $stockValue)");

echo json_encode(["message" => "Product added"]);
?>