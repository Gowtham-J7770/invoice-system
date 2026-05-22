<?php

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json");

include "db.php";

$user_id = (int)$_GET['user_id'];

$result = $conn->query("
    SELECT *
    FROM suppliers
    WHERE user_id = '$user_id'
    ORDER BY id DESC
");

$suppliers = [];

while ($row = $result->fetch_assoc()) {

    $suppliers[] = $row;
}

echo json_encode($suppliers);

?>