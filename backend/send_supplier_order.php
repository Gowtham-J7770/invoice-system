<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

//////////////////////////////////////////////////
// GET DATA
//////////////////////////////////////////////////

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email =
    trim($data['email'] ?? '');

$supplier_name =
    trim($data['supplier_name'] ?? '');

$items =
    $data['items'] ?? [];

$shop_name =
    trim($data['shop_name'] ?? '');

$owner_name =
    trim($data['owner_name'] ?? '');

$shop_phone =
    trim($data['shop_phone'] ?? '');

$shop_email =
    trim($data['shop_email'] ?? '');

$shop_address =
    trim($data['shop_address'] ?? '');

//////////////////////////////////////////////////
// VALIDATION
//////////////////////////////////////////////////

if (!$email) {

    echo json_encode([
        "error" =>
        "Supplier email missing"
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
        "error" =>
        "Invalid supplier email"
    ]);

    exit();
}

if (empty($items)) {

    echo json_encode([
        "error" =>
        "No products found"
    ]);

    exit();
}

//////////////////////////////////////////////////
// DATE & TIME
//////////////////////////////////////////////////

$date =
    date("d F Y");

$time =
    date("h:i A");

//////////////////////////////////////////////////
// BUILD ITEMS ROWS
//////////////////////////////////////////////////

$itemsRows = "";

foreach ($items as $index => $item) {

    $number =
        $index + 1;

    $product =
        $item['product_name'];

    $quantity =
        $item['quantity'];

    $itemsRows .= "

        <tr>

            <td
                style='
                    padding:12px;
                    border:1px solid #e5e7eb;
                '
            >
                {$number}
            </td>

            <td
                style='
                    padding:12px;
                    border:1px solid #e5e7eb;
                '
            >
                {$product}
            </td>

            <td
                style='
                    padding:12px;
                    border:1px solid #e5e7eb;
                    text-align:center;
                '
            >
                {$quantity}
            </td>

        </tr>
    ";
}

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
        $shop_name
    );

    //////////////////////////////////////////////////
    // TO
    //////////////////////////////////////////////////

    $mail->addAddress(
        $email,
        $supplier_name
    );

    //////////////////////////////////////////////////
    // CONTENT
    //////////////////////////////////////////////////

    $mail->Subject =
        "Restock Order Request";

    $mail->isHTML(true);

    //////////////////////////////////////////////////
    // EMAIL BODY
    //////////////////////////////////////////////////

    $mail->Body = "

<div
    style='
        font-family:Arial,sans-serif;
        background:#f3f4f6;
        padding:30px;
    '
>

    <div
        style='
            max-width:700px;
            margin:auto;
            background:white;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 4px 20px rgba(0,0,0,0.08);
        '
    >

        <!-- HEADER -->

        <div
            style='
                background:#111827;
                color:white;
                padding:30px;
            '
        >

            <h1
                style='
                    margin:0;
                    font-size:28px;
                '
            >
                {$shop_name}
            </h1>

            <p
                style='
                    margin-top:8px;
                    color:#d1d5db;
                '
            >
                Restock Order Request
            </p>

        </div>

        <!-- CONTENT -->

        <div
            style='
                padding:30px;
            '
        >

            <p
                style='
                    font-size:16px;
                '
            >
                Hello
                <b>{$supplier_name}</b>,
            </p>

            <p
                style='
                    color:#4b5563;
                    margin-top:10px;
                    line-height:1.6;
                '
            >
                Please supply the following products.
            </p>

            <!-- INFO -->

            <div
                style='
                    background:#f9fafb;
                    border-radius:12px;
                    padding:18px;
                    margin-top:25px;
                    margin-bottom:25px;
                    line-height:1.8;
                '
            >

                <p>
                    <b>Date:</b>
                    {$date}
                </p>

                <p>
                    <b>Time:</b>
                    {$time}
                </p>

                <p>
                    <b>Owner:</b>
                    {$owner_name}
                </p>

                <p>
                    <b>Phone:</b>
                    {$shop_phone}
                </p>

                <p>
                    <b>Email:</b>
                    {$shop_email}
                </p>

                <p>
                    <b>Address:</b>
                    {$shop_address}
                </p>

            </div>

            <!-- TABLE -->

            <table
                style='
                    width:100%;
                    border-collapse:collapse;
                    margin-top:10px;
                '
            >

                <thead>

                    <tr
                        style='
                            background:#111827;
                            color:white;
                        '
                    >

                        <th
                            style='
                                padding:12px;
                                text-align:left;
                            '
                        >
                            #
                        </th>

                        <th
                            style='
                                padding:12px;
                                text-align:left;
                            '
                        >
                            Product
                        </th>

                        <th
                            style='
                                padding:12px;
                                text-align:center;
                            '
                        >
                            Quantity
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {$itemsRows}

                </tbody>

            </table>

            <!-- FOOTER -->

            <div
                style='
                    margin-top:35px;
                    color:#4b5563;
                    line-height:1.8;
                '
            >

                <p>
                    Please confirm product availability.
                </p>

                <p>
                    Thank you 🤝
                </p>

                <p>
                    Regards,
                    <br>
                    <b>{$shop_name}</b>
                </p>

            </div>

        </div>

    </div>

</div>
";

    //////////////////////////////////////////////////
    // SEND
    //////////////////////////////////////////////////

    $mail->send();

    echo json_encode([
        "message" =>
        "Email sent successfully"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "error" =>
        $mail->ErrorInfo
    ]);
}
?>