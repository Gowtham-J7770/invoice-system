<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// PREFLIGHT

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

// VALIDATION

if (
    !$data ||
    !isset($data['id']) ||
    !isset($data['user_id'])
) {

    echo json_encode([
        "error" => "Invalid request"
    ]);

    exit();
}

$id = $data['id'];

$user_id = $data['user_id'];

// SECURE DELETE

$sql = "
    DELETE FROM clients
    WHERE id = '$id'
    AND user_id = '$user_id'
";

if ($conn->query($sql) === TRUE) {

    echo json_encode([
        "message" => "Client deleted"
    ]);

} else {

    echo json_encode([
        "error" => $conn->error
    ]);
}
?>