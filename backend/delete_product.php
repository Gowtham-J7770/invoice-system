<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

// 🔥 VALIDATION
if (!$data || !isset($data['id'])) {
    echo json_encode(["error" => "Invalid request"]);
    exit;
}

$id = $data['id'];

$conn->query("DELETE FROM products WHERE id = $id");

echo json_encode(["message" => "Product deleted"]);
?>