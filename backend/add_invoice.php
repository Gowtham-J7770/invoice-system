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

$user_id = 1; // temp
$client_id = $data['client_id'];
$items = $data['items'];
$total = $data['total'];
$hasInventory = $data['hasInventory']; // 🔥 IMPORTANT

// 🔥 VALIDATION
if (!$client_id || !$items || !$total) {
    echo json_encode(["error" => "Missing data"]);
    exit();
}

//////////////////////////////////////////////////
// 🔥 STEP 1 — STOCK VALIDATION BEFORE SAVE
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

        // skip NULL stock
        if ($currentStock !== null) {

            if ($qty > $currentStock) {
                echo json_encode([
                    "error" => "Not enough stock for $name"
                ]);
                exit();
            }
        }
    }
}

//////////////////////////////////////////////////
// 🔥 STEP 2 — CREATE INVOICE
//////////////////////////////////////////////////

$invoice_number = "INV-" . time();

$sql = "INSERT INTO invoices (user_id, client_id, invoice_number, subtotal, tax, total)
        VALUES ('$user_id', '$client_id', '$invoice_number', '$total', 0, '$total')";

if ($conn->query($sql) === TRUE) {

    $invoice_id = $conn->insert_id;

    //////////////////////////////////////////////////
    // 🔥 STEP 3 — SAVE ITEMS + REDUCE STOCK
    //////////////////////////////////////////////////

    foreach ($items as $item) {

        $name = $item['name'];
        $qty = $item['quantity'];
        $price = $item['price'];
        $item_total = $item['total'];

        // 🔥 SAVE ITEM
        $conn->query("INSERT INTO invoice_items (invoice_id, product_name, quantity, price, total)
                      VALUES ('$invoice_id', '$name', '$qty', '$price', '$item_total')");

        //////////////////////////////////////////////////
        // 🔥 STOCK REDUCTION
        //////////////////////////////////////////////////

        if ($hasInventory) {

            $result = $conn->query("SELECT stock FROM products WHERE name='$name'");
            $row = $result->fetch_assoc();

            $currentStock = $row['stock'];

            // skip NULL
            if ($currentStock !== null) {

                $newStock = $currentStock - $qty;

                $conn->query("UPDATE products SET stock=$newStock WHERE name='$name'");
            }
        }
    }

    echo json_encode(["message" => "Invoice saved successfully"]);

} else {
    echo json_encode(["error" => $conn->error]);
}
?>