<?php

session_start();

//////////////////////////////////////////////////
// CORS
//////////////////////////////////////////////////

header("Access-Control-Allow-Origin: http://localhost:5173");

header("Access-Control-Allow-Credentials: true");

header("Access-Control-Allow-Methods: POST, OPTIONS");

header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit();
}

//////////////////////////////////////////////////
// GET DATA
//////////////////////////////////////////////////

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email =
    trim($data['email'] ?? '');

$otp =
    trim($data['otp'] ?? '');

//////////////////////////////////////////////////
// VERIFY OTP
//////////////////////////////////////////////////

if (
    isset($_SESSION['otp']) &&
    isset($_SESSION['otp_email']) &&
    $_SESSION['otp_email'] === $email &&
    $_SESSION['otp'] === $otp
) {

    //////////////////////////////////////////////////
    // CLEAR SESSION
    //////////////////////////////////////////////////

    unset($_SESSION['otp']);

    unset($_SESSION['otp_email']);

    //////////////////////////////////////////////////
    // SUCCESS
    //////////////////////////////////////////////////

    echo json_encode([
        "success" => true
    ]);

} else {

    //////////////////////////////////////////////////
    // DEBUG
    //////////////////////////////////////////////////

    echo json_encode([
        "success" => false,
        "session_otp" =>
            $_SESSION['otp'] ?? null,
        "session_email" =>
            $_SESSION['otp_email'] ?? null
    ]);
}
?>