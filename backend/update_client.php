<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$name = $data['name'];
$email = $data['email'];
$phone = $data['phone'];
$address = $data['address'];
$pincode = $data['pincode'];

if (!$id) {
    echo json_encode(["error" => "ID required"]);
    exit();
}

$sql = "UPDATE clients SET 
        name='$name',
        email='$email',
        phone='$phone',
        address='$address',
        pincode='$pincode'
        WHERE id=$id";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Client updated"]);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>