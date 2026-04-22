<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

// TEMP user_id (same as before)
$user_id = 1;

$sql = "SELECT * FROM clients WHERE user_id = $user_id";
$result = $conn->query($sql);

$clients = [];

while ($row = $result->fetch_assoc()) {
    $clients[] = $row;
}

echo json_encode($clients);
?>