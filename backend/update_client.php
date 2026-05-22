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

// GET DATA

$id = $data['id'];

$user_id = $data['user_id'];

$name = trim($data['name']);

$email = trim($data['email']);

$phone = trim($data['phone']);

$address = trim($data['address']);

$pincode = trim($data['pincode']);

// VALIDATION

if (!$id) {

    echo json_encode([
        "error" => "ID required"
    ]);

    exit();
}

// DUPLICATE CHECK FOR SAME USER

$check = $conn->query("
    SELECT id, phone, email
    FROM clients
    WHERE user_id = '$user_id'
    AND name = '$name'
    AND id != '$id'
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

// SECURE UPDATE

$sql = "
    UPDATE clients
    SET
        name='$name',
        email='$email',
        phone='$phone',
        address='$address',
        pincode='$pincode'
    WHERE id='$id'
    AND user_id='$user_id'
";

if ($conn->query($sql) === TRUE) {

    echo json_encode([
        "message" => "Client updated"
    ]);

} else {

    echo json_encode([
        "error" => $conn->error
    ]);
}
?>