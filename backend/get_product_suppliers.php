<?php

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json");

include "db.php";

$product_id =
(int)$_GET['product_id'];

$result = $conn->query("
    SELECT
        suppliers.*
    FROM supplier_products

    INNER JOIN suppliers
    ON supplier_products.supplier_id =
       suppliers.id

    WHERE supplier_products.product_id =
          '$product_id'
");

$suppliers = [];

while ($row = $result->fetch_assoc()) {

    $suppliers[] = $row;
}

echo json_encode($suppliers);

?>