<?php

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json");

include "db.php";

// GET USER ID

$user_id = $_GET['user_id'];

$response = [];

//////////////////////////////////////////////////
// TOTAL REVENUE
//////////////////////////////////////////////////

$res = $conn->query("
    SELECT SUM(total) as revenue
    FROM invoices
    WHERE user_id = '$user_id'
");

$row = $res->fetch_assoc();

$response['revenue'] =
    $row['revenue'] ?? 0;

//////////////////////////////////////////////////
// TOTAL INVOICES
//////////////////////////////////////////////////

$res = $conn->query("
    SELECT COUNT(*) as count
    FROM invoices
    WHERE user_id = '$user_id'
");

$row = $res->fetch_assoc();

$response['invoices'] =
    $row['count'] ?? 0;

//////////////////////////////////////////////////
// TOTAL CLIENTS
//////////////////////////////////////////////////

$res = $conn->query("
    SELECT COUNT(*) as count
    FROM clients
    WHERE user_id = '$user_id'
");

$row = $res->fetch_assoc();

$response['clients'] =
    $row['count'] ?? 0;

//////////////////////////////////////////////////
// TOTAL PRODUCTS
//////////////////////////////////////////////////

$res = $conn->query("
    SELECT COUNT(*) as count
    FROM products
    WHERE user_id = '$user_id'
");

$row = $res->fetch_assoc();

$response['products'] =
    $row['count'] ?? 0;

echo json_encode($response);
?>