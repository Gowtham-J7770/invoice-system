<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "db.php";
require('fpdf/fpdf.php');

$data = json_decode(file_get_contents("php://input"), true);

$client_id = $data['client_id'];
$items = $data['items'];
$total = $data['total'];
$hasInventory = $data['hasInventory']; // 🔥 NEW

//////////////////////////////////////////////////
// 🔥 STEP 1 — STOCK VALIDATION BEFORE ANYTHING
//////////////////////////////////////////////////

if ($hasInventory) {
    foreach ($items as $item) {

        $name = $item['name'];
        $qty = $item['quantity'];

        $result = $conn->query("SELECT stock FROM products WHERE name='$name'");
        $row = $result->fetch_assoc();

        if (!$row) {
            echo json_encode(["error" => "Product not found: $name"]);
            exit();
        }

        $currentStock = $row['stock'];

        if ($currentStock !== null && $qty > $currentStock) {
            echo json_encode([
                "error" => "Not enough stock for $name"
            ]);
            exit();
        }
    }
}

//////////////////////////////////////////////////
// 🔥 GENERATE INVOICE NUMBER
//////////////////////////////////////////////////

$invoice_number = "INV-" . time();

//////////////////////////////////////////////////
// 🔥 GET USER + CLIENT
//////////////////////////////////////////////////

$userQuery = $conn->query("SELECT * FROM users WHERE id = 1");
$user = $userQuery->fetch_assoc();

$shopName = $user['shop_name'];
$shopAddress = $user['address'];
$shopPhone = $user['phone'];

$clientQuery = $conn->query("SELECT * FROM clients WHERE id = $client_id");
$client = $clientQuery->fetch_assoc();

$clientEmail = $client['email'];
$clientName = $client['name'];

//////////////////////////////////////////////////
// 🔥 SAVE INVOICE
//////////////////////////////////////////////////

$conn->query("INSERT INTO invoices (user_id, client_id, invoice_number, subtotal, tax, total)
VALUES (1, '$client_id', '$invoice_number', '$total', 0, '$total')");

$invoice_id = $conn->insert_id;

//////////////////////////////////////////////////
// 🔥 SAVE ITEMS + REDUCE STOCK
//////////////////////////////////////////////////

foreach ($items as $item) {

    $name = $item['name'];
    $qty = $item['quantity'];
    $price = $item['price'];
    $item_total = $item['total'];

    // SAVE ITEM
    $conn->query("INSERT INTO invoice_items 
    (invoice_id, product_name, quantity, price, total)
    VALUES ('$invoice_id', '$name', '$qty', '$price', '$item_total')");

    //////////////////////////////////////////////////
    // 🔥 STOCK REDUCTION
    //////////////////////////////////////////////////

    if ($hasInventory) {

        $result = $conn->query("SELECT stock FROM products WHERE name='$name'");
        $row = $result->fetch_assoc();

        $currentStock = $row['stock'];

        if ($currentStock !== null) {
            $newStock = $currentStock - $qty;
            $conn->query("UPDATE products SET stock=$newStock WHERE name='$name'");
        }
    }
}

//////////////////////////////////////////////////
// 🔥 PDF GENERATION (UNCHANGED)
//////////////////////////////////////////////////

$pdf = new FPDF();
$pdf->AddPage();

$pdf->SetFont('Arial', 'B', 16);
$pdf->Cell(100, 10, $shopName, 0, 0);

$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, "INVOICE", 0, 1, 'R');

$pdf->SetFont('Arial', '', 11);
$pdf->Cell(100, 6, $shopAddress, 0, 0);
$pdf->Cell(0, 6, "Invoice: $invoice_number", 0, 1, 'R');

$pdf->Cell(100, 6, "Phone: $shopPhone", 0, 0);
$pdf->Cell(0, 6, "Date: " . date("d/m/Y"), 0, 1, 'R');

$pdf->Ln(5);

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(0, 8, "Bill To:", 0, 1);

$pdf->SetFont('Arial', '', 11);
$pdf->Cell(0, 6, $clientName, 0, 1);

$pdf->Ln(5);

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(70, 10, 'Item', 1, 0, 'L');
$pdf->Cell(30, 10, 'Price', 1, 0, 'R');
$pdf->Cell(30, 10, 'Qty', 1, 0, 'C');
$pdf->Cell(40, 10, 'Total', 1, 1, 'R');

$pdf->SetFont('Arial', '', 11);

foreach ($items as $item) {
    $pdf->Cell(70, 10, $item['name'], 1, 0, 'L');
    $pdf->Cell(30, 10, "₹ " . number_format($item['price'], 2), 1, 0, 'R');
    $pdf->Cell(30, 10, $item['quantity'], 1, 0, 'C');
    $pdf->Cell(40, 10, "₹ " . number_format($item['total'], 2), 1, 1, 'R');
}

$pdf->Ln(5);

$pdf->SetFont('Arial', 'B', 13);
$pdf->Cell(130, 10, 'Total', 0, 0, 'R');
$pdf->Cell(40, 10, "₹ " . number_format($total, 2), 0, 1, 'R');

$pdf->Ln(10);
$pdf->SetFont('Arial', 'I', 10);
$pdf->Cell(0, 10, "Thank you for your business!", 0, 1, 'C');

$filePath = "invoice_$invoice_number.pdf";
$pdf->Output("F", $filePath);

//////////////////////////////////////////////////
// 🔥 EMAIL (UNCHANGED)
//////////////////////////////////////////////////

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;

    $mail->Username = 'herogamer7771@gmail.com';
    $mail->Password = 'lwmjsfwelbvwvxgl';

    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('herogamer7771@gmail.com', $shopName);
    $mail->addAddress($clientEmail, $clientName);

    $mail->Subject = "Invoice - $invoice_number";

    $body = "
      <h2>$invoice_number</h2>
      <p>Hi $clientName,</p>
      <p>You have received a new invoice from <b>$shopName</b>.</p>
      <p><b>Total Amount:</b> ₹ $total</p>
      <p>Please find the invoice attached to this email.</p>
      <br>
      <p>
      Regards,<br>
      <b>$shopName</b><br>
      $shopAddress<br>
      Phone: $shopPhone
      </p>
    ";

    $mail->isHTML(true);
    $mail->Body = $body;

    $mail->addAttachment($filePath);

    $mail->send();

    unlink($filePath);

    echo json_encode(["message" => "Invoice sent successfully"]);

} catch (Exception $e) {
    echo json_encode(["error" => $mail->ErrorInfo]);
}
?>