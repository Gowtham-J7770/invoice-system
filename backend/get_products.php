<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

$user_id = (int)$_GET['user_id'];

$result = $conn->query("
    SELECT *
    FROM products
    WHERE user_id = '$user_id'
    ORDER BY id DESC
");

$products = [];

while ($row = $result->fetch_assoc()) {

    $row['selling_options'] = [];

    if ($row['inventory_type'] === 'measurable') {

        $options_result = $conn->query("
            SELECT
                id,
                label,
                quantity,
                price
            FROM product_selling_options
            WHERE product_id = '{$row['id']}'
            ORDER BY quantity ASC
        ");

        while ($option = $options_result->fetch_assoc()) {
            $row['selling_options'][] = $option;
        }
    }

    $products[] = $row;
}

echo json_encode($products);

?>