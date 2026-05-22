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

$name = trim($data['name'] ?? '');

$phone = trim($data['phone'] ?? '');

$email = trim($data['email'] ?? '');

//////////////////////////////////////////////////
// VALIDATIONS
//////////////////////////////////////////////////

if (!$name || !$phone || !$email) {

    echo json_encode([
        "error" => "All fields are required"
    ]);

    exit();
}

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {

    echo json_encode([
        "error" => "Invalid email"
    ]);

    exit();
}

//////////////////////////////////////////////////
// UNIQUE CHECK
//////////////////////////////////////////////////

$check = $conn->query("
    SELECT id
    FROM suppliers
    WHERE user_id = '$user_id'
    AND id != '$id'
    AND (
        name = '$name'
        OR phone = '$phone'
        OR email = '$email'
    )
");

if ($check->num_rows > 0) {

    echo json_encode([
        "error" =>
        "Supplier already exists"
    ]);

    exit();
}

//////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////

$conn->query("
    UPDATE suppliers
    SET
        name = '$name',
        phone = '$phone',
        email = '$email'
    WHERE id = '$id'
    AND user_id = '$user_id'
");

echo json_encode([
    "message" =>
    "Supplier updated successfully"
]);

?>