<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

include "db.php";

require('fpdf/fpdf.php');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$data = json_decode(file_get_contents("php://input"), true);

//////////////////////////////////////////////////
// GET DATA
//////////////////////////////////////////////////

$user_id = (int)($data['user_id'] ?? 0);
$client_id = (int)($data['client_id'] ?? 0);
$items = $data['items'] ?? [];
$total = (float)($data['total'] ?? 0);

//////////////////////////////////////////////////
// VALIDATION
//////////////////////////////////////////////////

if (!$user_id || !$client_id || empty($items) || $total <= 0) {
    echo json_encode([
        "error" => "Missing data"
    ]);
    exit();
}

//////////////////////////////////////////////////
// STOCK VALIDATION
//////////////////////////////////////////////////

foreach ($items as $item) {

    $product_id = (int)($item['product_id'] ?? 0);
    $qty = (float)($item['quantity'] ?? 0);

    if (!$product_id || $qty <= 0) {
        echo json_encode([
            "error" => "Invalid invoice item"
        ]);
        exit();
    }

    $result = $conn->query("
        SELECT name, stock
        FROM products
        WHERE id = '$product_id'
          AND user_id = '$user_id'
    ");

    if (!$result || $result->num_rows === 0) {
        echo json_encode([
            "error" => "Product not found"
        ]);
        exit();
    }

    $row = $result->fetch_assoc();

    if ($qty > (float)$row['stock']) {
        echo json_encode([
            "error" => "Not enough stock for " . $row['name']
        ]);
        exit();
    }
}

//////////////////////////////////////////////////
// GENERATE INVOICE NUMBER
//////////////////////////////////////////////////

$invoice_number = "INV-" . time();

//////////////////////////////////////////////////
// GET USER DETAILS
//////////////////////////////////////////////////

$userQuery = $conn->query("
    SELECT *
    FROM users
    WHERE id = '$user_id'
");

$user = $userQuery->fetch_assoc();

$shopName = $user['shop_name'] ?? 'ShopDesk';
$shopAddress = $user['address'] ?? '';
$shopPhone = $user['phone'] ?? '';

//////////////////////////////////////////////////
// GET CLIENT DETAILS
//////////////////////////////////////////////////

$clientQuery = $conn->query("
    SELECT *
    FROM clients
    WHERE id = '$client_id'
      AND user_id = '$user_id'
");

$client = $clientQuery->fetch_assoc();

if (!$client) {
    echo json_encode([
        "error" => "Client not found"
    ]);
    exit();
}

$clientEmail = $client['email'] ?? '';
$clientName = $client['name'] ?? 'Customer';

//////////////////////////////////////////////////
// SAVE INVOICE
//////////////////////////////////////////////////

$conn->query("
    INSERT INTO invoices (
        user_id,
        client_id,
        invoice_number,
        subtotal,
        tax,
        total
    )
    VALUES (
        '$user_id',
        '$client_id',
        '$total',
        '$total',
        0,
        '$total'
    )
");

$invoice_id = $conn->insert_id;

//////////////////////////////////////////////////
// SAVE ITEMS + REDUCE STOCK
//////////////////////////////////////////////////

foreach ($items as $item) {

    $product_id = (int)$item['product_id'];
    $name = $conn->real_escape_string($item['name']);
    $qty = (float)$item['quantity'];
    $price = (float)$item['price'];
    $item_total = (float)$item['total'];

    // Save invoice item
    $conn->query("
        INSERT INTO invoice_items (
            invoice_id,
            product_name,
            quantity,
            price,
            total
        )
        VALUES (
            '$invoice_id',
            '$name',
            '$qty',
            '$price',
            '$item_total'
        )
    ");

    // Reduce stock
    $conn->query("
        UPDATE products
        SET stock = stock - $qty
        WHERE id = '$product_id'
          AND user_id = '$user_id'
    ");
}

//////////////////////////////////////////////////
// PDF GENERATION
//////////////////////////////////////////////////

$subtotal = $total;
$discount = 0;
$gst_rate = 0;
$gst_amount = 0;
$final_total = $subtotal - $discount + $gst_amount;

$pdf = new FPDF();
$pdf->AddPage();

//////////////////////////////////////////////////
// HEADER
//////////////////////////////////////////////////

$pdf->SetFont('Arial', 'B', 20);
$pdf->Cell(110, 10, $shopName, 0, 0);

$pdf->SetFont('Arial', 'B', 24);
$pdf->Cell(0, 10, 'INVOICE', 0, 1, 'R');

$pdf->SetFont('Arial', '', 10);

if ($shopAddress) {
    $pdf->Cell(110, 6, $shopAddress, 0, 0);
} else {
    $pdf->Cell(110, 6, '', 0, 0);
}

$pdf->Cell(0, 6, "Invoice No: $invoice_number", 0, 1, 'R');

$pdf->Cell(110, 6, "Phone: $shopPhone", 0, 0);
$pdf->Cell(0, 6, "Date: " . date("d/m/Y"), 0, 1, 'R');

$pdf->Ln(8);

//////////////////////////////////////////////////
// BILL TO
//////////////////////////////////////////////////

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(0, 8, 'Bill To', 0, 1);

$pdf->SetFont('Arial', '', 11);
$pdf->Cell(0, 6, $clientName, 0, 1);

if (!empty($clientEmail)) {
    $pdf->Cell(0, 6, $clientEmail, 0, 1);
}

if (!empty($client['phone'])) {
    $pdf->Cell(0, 6, $client['phone'], 0, 1);
}

$pdf->Ln(6);

//////////////////////////////////////////////////
// ITEMS TABLE HEADER
//////////////////////////////////////////////////

$pdf->SetFont('Arial', 'B', 11);

// Light gray header fill
$pdf->SetFillColor(243, 244, 246);

$pdf->Cell(80, 10, 'Item', 1, 0, 'L', true);
$pdf->Cell(25, 10, 'Qty', 1, 0, 'C', true);
$pdf->Cell(40, 10, 'Price', 1, 0, 'R', true);
$pdf->Cell(45, 10, 'Total', 1, 1, 'R', true);

//////////////////////////////////////////////////
// ITEMS
//////////////////////////////////////////////////

$pdf->SetFont('Arial', '', 10);

foreach ($items as $item) {

    // Qty with unit (kg / L)
    $qtyText = $item['quantity'];

    if (
        isset($item['inventory_type']) &&
        $item['inventory_type'] === 'measurable' &&
        !empty($item['base_unit'])
    ) {
        $qtyText .= ' ' . $item['base_unit'];
    }

    $pdf->Cell(80, 10, $item['name'], 1, 0, 'L');
    $pdf->Cell(25, 10, $qtyText, 1, 0, 'C');
    $pdf->Cell(
        40,
        10,
        'Rs. ' . number_format($item['price'], 2),
        1,
        0,
        'R'
    );
    $pdf->Cell(
        45,
        10,
        'Rs. ' . number_format($item['total'], 2),
        1,
        1,
        'R'
    );
}

if (count($items) === 0) {
    $pdf->Cell(
        190,
        12,
        'No items added.',
        1,
        1,
        'C'
    );
}

$pdf->Ln(8);

//////////////////////////////////////////////////
// TOTAL BREAKDOWN
//////////////////////////////////////////////////

$subtotal = $total;
$discount = 0;
$gst_rate = 0;
$gst_amount = 0;
$final_total = $subtotal;

$pdf->SetFont('Arial', '', 11);

// Subtotal
$pdf->Cell(145, 8, 'Subtotal', 0, 0, 'R');
$pdf->Cell(
    45,
    8,
    'Rs. ' . number_format($subtotal, 2),
    0,
    1,
    'R'
);

// Discount
$pdf->SetTextColor(107, 114, 128);
$pdf->Cell(145, 8, 'Discount', 0, 0, 'R');
$pdf->Cell(45, 8, 'Rs. 0.00', 0, 1, 'R');

// GST
$pdf->Cell(145, 8, 'GST (0%)', 0, 0, 'R');
$pdf->Cell(45, 8, 'Rs. 0.00', 0, 1, 'R');

// Reset text color
$pdf->SetTextColor(0, 0, 0);

$pdf->Ln(2);

// Divider line
$currentY = $pdf->GetY();
$pdf->Line(140, $currentY, 200, $currentY);

$pdf->Ln(3);

// Grand Total
$pdf->SetFont('Arial', 'B', 16);

$pdf->Cell(145, 10, 'Grand Total', 0, 0, 'R');
$pdf->Cell(
    45,
    10,
    'Rs. ' . number_format($final_total, 2),
    0,
    1,
    'R'
);

//////////////////////////////////////////////////
// FOOTER
//////////////////////////////////////////////////

$pdf->Ln(10);

// Top border line
$currentY = $pdf->GetY();
$pdf->Line(10, $currentY, 200, $currentY);

$pdf->Ln(6);

$pdf->SetFont('Arial', 'I', 10);
$pdf->SetTextColor(107, 114, 128);

$pdf->Cell(
    0,
    8,
    'Thank you for your business!',
    0,
    1,
    'C'
);

// Reset text color
$pdf->SetTextColor(0, 0, 0);

//////////////////////////////////////////////////
// SAVE PDF
//////////////////////////////////////////////////

$filePath = "invoice_$invoice_number.pdf";
$pdf->Output("F", $filePath);
//////////////////////////////////////////////////
// EMAIL
//////////////////////////////////////////////////

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

    if ($clientEmail) {
        $mail->addAddress($clientEmail, $clientName);
    }

    $mail->Subject = "Invoice - $invoice_number";
    $mail->isHTML(true);

    $mail->Body = "
        <h2>$invoice_number</h2>
        <p>Hi $clientName,</p>
        <p>You have received a new invoice from <b>$shopName</b>.</p>
        <p><b>Total Amount:</b> ₹ " . number_format($total, 2) . "</p>
        <p>Please find the invoice attached.</p>
    ";

    $mail->addAttachment($filePath);
    $mail->send();

    unlink($filePath);

    echo json_encode([
        "message" => "Invoice sent successfully"
    ]);
} catch (Exception $e) {

    if (file_exists($filePath)) {
        unlink($filePath);
    }

    echo json_encode([
        "error" => $mail->ErrorInfo
    ]);
}
