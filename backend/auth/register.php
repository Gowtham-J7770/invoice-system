<?php

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: POST, OPTIONS");

header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include("../db.php");

// GET DATA

$data = json_decode(file_get_contents("php://input"));

$name = trim($data->name ?? '');

$shop_name = trim($data->shop_name ?? '');

$email = trim($data->email ?? '');

$password = trim($data->password ?? '');

$phone = trim($data->phone ?? '');

$address = trim($data->address ?? '');

// VALIDATION

if (
    !$name ||
    !$shop_name ||
    !$email ||
    !$password
) {

    echo json_encode([
        "success" => false,
        "message" => "Required fields missing"
    ]);

    exit();
}

// EMAIL VALIDATION

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email"
    ]);

    exit();
}

// CHECK EXISTING EMAIL

$check = $conn->prepare("
    SELECT id
    FROM users
    WHERE email = ?
");

$check->bind_param("s", $email);

$check->execute();

$result = $check->get_result();

if ($result->num_rows > 0) {

    echo json_encode([
        "success" => false,
        "message" => "Email already exists"
    ]);

    exit();
}

// HASH PASSWORD

$hashedPassword = password_hash(
    $password,
    PASSWORD_DEFAULT
);

// INSERT USER

$stmt = $conn->prepare("
    INSERT INTO users
    (
        name,
        shop_name,
        email,
        password,
        phone,
        address
    )
    VALUES (?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "ssssss",
    $name,
    $shop_name,
    $email,
    $hashedPassword,
    $phone,
    $address
);

// SUCCESS

if ($stmt->execute()) {

    $user_id = $conn->insert_id;

    // FETCH CREATED USER

    $userResult = $conn->query("
        SELECT *
        FROM users
        WHERE id = '$user_id'
    ");

    $user = $userResult->fetch_assoc();

    // REMOVE PASSWORD

    unset($user['password']);

    echo json_encode([
        "success" => true,
        "message" => "Registration successful",
        "user" => $user
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Registration failed"
    ]);
}

?>