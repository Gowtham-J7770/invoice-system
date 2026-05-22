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
// NAME CHECK
//////////////////////////////////////////////////

$nameCheck = $conn->query("
    SELECT id
    FROM suppliers
    WHERE user_id = '$user_id'
    AND name = '$name'
");

if ($nameCheck->num_rows > 0) {

    echo json_encode([
        "error" =>
        "Supplier name already exists"
    ]);

    exit();
}

//////////////////////////////////////////////////
// PHONE CHECK
//////////////////////////////////////////////////

$phoneCheck = $conn->query("
    SELECT id
    FROM suppliers
    WHERE user_id = '$user_id'
    AND phone = '$phone'
");

if ($phoneCheck->num_rows > 0) {

    echo json_encode([
        "error" =>
        "Phone number already exists"
    ]);

    exit();
}

//////////////////////////////////////////////////
// EMAIL CHECK
//////////////////////////////////////////////////

$emailCheck = $conn->query("
    SELECT id
    FROM suppliers
    WHERE user_id = '$user_id'
    AND email = '$email'
");

if ($emailCheck->num_rows > 0) {

    echo json_encode([
        "error" =>
        "Email already exists"
    ]);

    exit();
}

//////////////////////////////////////////////////
// INSERT
//////////////////////////////////////////////////

$conn->query("
    INSERT INTO suppliers (
        user_id,
        name,
        phone,
        email
    )
    VALUES (
        '$user_id',
        '$name',
        '$phone',
        '$email'
    )
");

echo json_encode([
    "message" =>
    "Supplier added successfully"
]);
