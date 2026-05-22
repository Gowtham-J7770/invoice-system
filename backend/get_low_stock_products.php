<?php

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json");

include "db.php";

$user_id = (int)$_GET['user_id'];

$result = $conn->query("
    SELECT
        p.*,

        (
            SELECT COUNT(*)
            FROM supplier_products sp

            INNER JOIN suppliers s
            ON sp.supplier_id = s.id

            WHERE sp.product_id = p.id
            AND s.user_id = '$user_id'
        ) AS supplier_count

    FROM products p

    WHERE p.user_id = '$user_id'

    AND p.stock <= p.low_stock_limit

    ORDER BY p.stock ASC
");

$products = [];

while ($row = $result->fetch_assoc()) {

    $products[] = $row;
}

echo json_encode($products);

?>