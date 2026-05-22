<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// PREFLIGHT

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

// GET DATA

$user_id = $data['user_id'];

$name = trim($data['name']);

$email = trim($data['email']);

$phone = trim($data['phone']);

$address = trim($data['address']);

$pincode = trim($data['pincode']);

// VALIDATION

if (
    !$name ||
    !$email ||
    !$phone ||
    !$address ||
    !$pincode
) {

    echo json_encode([
        "error" => "All fields required"
    ]);

    exit();
}

// DUPLICATE CHECK ONLY FOR SAME USER

$check = $conn->query("
    SELECT id, phone, email
    FROM clients
    WHERE user_id = '$user_id'
    AND name = '$name'
    AND (
        phone = '$phone'
        OR email = '$email'
    )
");

if ($check->num_rows > 0) {

    $row = $check->fetch_assoc();

    if ($row['phone'] == $phone) {

        echo json_encode([
            "error" => "Client with same name and phone already exists"
        ]);

    } else if ($row['email'] == $email) {

        echo json_encode([
            "error" => "Client with same name and email already exists"
        ]);
    }

    exit();
}

// INSERT CLIENT

$sql = "
    INSERT INTO clients
    (
        user_id,
        name,
        email,
        phone,
        address,
        pincode
    )
    VALUES
    (
        '$user_id',
        '$name',
        '$email',
        '$phone',
        '$address',
        '$pincode'
    )
";

if ($conn->query($sql) === TRUE) {

    echo json_encode([
        "message" => "Client added successfully"
    ]);

} else {

    echo json_encode([
        "error" => $conn->error
    ]);
}
?>