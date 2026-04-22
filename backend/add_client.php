<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// HANDLE PREFLIGHT REQUEST
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$phone = $data['phone'];
$address = $data['address'];
$pincode = $data['pincode'];
if (!$name || !$email || !$phone || !$address || !$pincode) {
    echo json_encode(["error" => "All fields required"]);
    exit();
}

// TEMP user_id (we'll replace after auth system)
$user_id = 1;

$sql = "INSERT INTO clients (user_id, name, email, phone, address, pincode)
        VALUES ('$user_id', '$name', '$email', '$phone', '$address', '$pincode')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Client added successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}
