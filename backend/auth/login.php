<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../vendor/autoload.php';

include("../db.php");

use Firebase\JWT\JWT;

$key = "billing_system_super_secret_jwt_key_2026_project_secure";

// GET DATA

$data = json_decode(file_get_contents("php://input"));

$email = trim($data->email ?? '');

$password = trim($data->password ?? '');

// FIND USER

$stmt = $conn->prepare("
    SELECT *
    FROM users
    WHERE email = ?
");

$stmt->bind_param("s", $email);

$stmt->execute();

$result = $stmt->get_result();

// USER NOT FOUND

if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password"
    ]);

    exit();
}

$user = $result->fetch_assoc();

// PASSWORD CHECK

if (!password_verify($password, $user['password'])) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password"
    ]);

    exit();
}

// JWT PAYLOAD

$payload = [
    "id" => $user['id'],
    "name" => $user['name'],
    "email" => $user['email'],
    "shop_name" => $user['shop_name'],
    "exp" => time() + (60 * 60 * 24)
];

// GENERATE TOKEN

$token = JWT::encode(
    $payload,
    $key,
    'HS256'
);

// REMOVE PASSWORD BEFORE RESPONSE

unset($user['password']);

// FINAL RESPONSE

echo json_encode([
    "success" => true,
    "token" => $token,
    "user" => $user
]);

?>