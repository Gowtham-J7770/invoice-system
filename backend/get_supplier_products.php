<?php

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json");

include "db.php";

$supplier_id =
(int)$_GET['supplier_id'];

$result = $conn->query("
    SELECT
        products.*
    FROM supplier_products

    INNER JOIN products
        ON supplier_products.product_id =
           products.id

    WHERE supplier_products.supplier_id =
          '$supplier_id'
");

$products = [];

while ($row = $result->fetch_assoc()) {

    $products[] = $row;
}

echo json_encode($products);

?>