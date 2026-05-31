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
// PHPMailer
//////////////////////////////////////////////////

require '../PHPMailer/src/Exception.php';

require '../PHPMailer/src/PHPMailer.php';

require '../PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;

use PHPMailer\PHPMailer\Exception;

//////////////////////////////////////////////////
// GET DATA
//////////////////////////////////////////////////

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email =
    trim($data['email'] ?? '');

//////////////////////////////////////////////////
// VALIDATION
//////////////////////////////////////////////////

if (!$email) {

    echo json_encode([
        "success" => false,
        "message" => "Email required"
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
        "success" => false,
        "message" => "Invalid email"
    ]);

    exit();
}

//////////////////////////////////////////////////
// GENERATE OTP
//////////////////////////////////////////////////

$otp =
    rand(100000, 999999);

$_SESSION['otp'] =
    (string)$otp;

$_SESSION['otp_email'] =
    $email;

//////////////////////////////////////////////////
// MAIL
//////////////////////////////////////////////////

$mail = new PHPMailer(true);

try {

    $mail->isSMTP();

    $mail->Host =
        'smtp.gmail.com';

    $mail->SMTPAuth = true;

    $mail->Username =
        'herogamer7771@gmail.com';

    $mail->Password =
        'lwmjsfwelbvwvxgl';

    $mail->SMTPSecure =
        'tls';

    $mail->Port = 587;

    //////////////////////////////////////////////////
    // FROM
    //////////////////////////////////////////////////

    $mail->setFrom(
        'herogamer7771@gmail.com',
        'SHOP DESK'
    );

    //////////////////////////////////////////////////
    // TO
    //////////////////////////////////////////////////

    $mail->addAddress($email);

    //////////////////////////////////////////////////
    // CONTENT
    //////////////////////////////////////////////////

    $mail->isHTML(true);

    $mail->Subject =
        'SHOP DESK Email Verification OTP';

    $mail->Body = "

        <div
            style='
                font-family:Arial;
                padding:30px;
                background:#f9fafb;
            '
        >

            <div
                style='
                    max-width:500px;
                    margin:auto;
                    background:white;
                    padding:30px;
                    border-radius:12px;
                '
            >

                <h2
                    style='
                        margin-top:0;
                        color:#08152f;
                    '
                >
                    Email Verification
                </h2>

                <p>
                    Welcome to
                    <b>SHOP DESK</b>.
                </p>

                <p>
                    Use the following OTP
                    to verify your email:
                </p>

                <div
                    style='
                        font-size:36px;
                        font-weight:bold;
                        letter-spacing:8px;
                        margin:30px 0;
                        color:#08152f;
                    '
                >
                    $otp
                </div>

                <p
                    style='
                        color:#6b7280;
                        font-size:14px;
                    '
                >
                    This OTP is valid only
                    for your current session.
                </p>

            </div>

        </div>

    ";

    //////////////////////////////////////////////////
    // SEND
    //////////////////////////////////////////////////

    $mail->send();

    echo json_encode([
        "success" => true
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $mail->ErrorInfo
    ]);
}
?>