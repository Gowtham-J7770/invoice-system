<?php

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Headers: Content-Type");

header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "db.php";

// GET DATA

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];

$name = trim($data['name']);

$email = trim($data['email']);

$shop_name = trim($data['shop_name']);

$address = trim($data['address']);

$phone = trim($data['phone']);

$currentPassword = trim(
    $data['currentPassword'] ?? ''
);

$newPassword = trim(
    $data['password'] ?? ''
);

// VALIDATION

if (
    !$id ||
    !$name ||
    !$email ||
    !$shop_name
) {

    echo json_encode([
        "error" => "Required fields missing"
    ]);

    exit();
}

// GET USER

$result = $conn->query("
    SELECT *
    FROM users
    WHERE id = '$id'
");

$user = $result->fetch_assoc();

if (!$user) {

    echo json_encode([
        "error" => "User not found"
    ]);

    exit();
}

//////////////////////////////////////////////////
// PASSWORD CHANGE
//////////////////////////////////////////////////

$passwordQuery = "";

if (!empty($newPassword)) {

    // CURRENT PASSWORD REQUIRED

    if (empty($currentPassword)) {

        echo json_encode([
            "error" => "Current password required"
        ]);

        exit();
    }

    // VERIFY OLD PASSWORD

    if (
        !password_verify(
            $currentPassword,
            $user['password']
        )
    ) {

        echo json_encode([
            "error" => "Current password incorrect"
        ]);

        exit();
    }

    $hashedPassword = password_hash(
        $newPassword,
        PASSWORD_DEFAULT
    );

    $passwordQuery = "
        ,
        password = '$hashedPassword',
        password_updated_at = CURRENT_TIMESTAMP
    ";
}

//////////////////////////////////////////////////
// UPDATE USER
//////////////////////////////////////////////////

$conn->query("
    UPDATE users
    SET
        name = '$name',
        email = '$email',
        shop_name = '$shop_name',
        address = '$address',
        phone = '$phone'
        $passwordQuery
    WHERE id = '$id'
");

//////////////////////////////////////////////////
// FETCH UPDATED USER
//////////////////////////////////////////////////

$updated = $conn->query("
    SELECT *
    FROM users
    WHERE id = '$id'
");

$updatedUser = $updated->fetch_assoc();

unset($updatedUser['password']);

//////////////////////////////////////////////////
// RESPONSE
//////////////////////////////////////////////////

echo json_encode([
    "message" => "Profile updated",
    "user" => $updatedUser
]);

?>