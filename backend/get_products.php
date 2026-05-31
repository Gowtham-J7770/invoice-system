<?php

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json");

include "db.php";

$user_id =
    (int)$_GET['user_id'];

//////////////////////////////////////////////////
// GET PRODUCTS
//////////////////////////////////////////////////

$result = $conn->query("

    SELECT *

    FROM products

    WHERE user_id = '$user_id'

    ORDER BY id DESC

");

$products = [];

//////////////////////////////////////////////////
// LOOP PRODUCTS
//////////////////////////////////////////////////

while (
    $row =
    $result->fetch_assoc()
) {

    //////////////////////////////////////////////////
    // DEFAULT
    //////////////////////////////////////////////////

    $row['has_suppliers'] = 0;

    //////////////////////////////////////////////////
    // CHECK SUPPLIERS
    //////////////////////////////////////////////////

    $check =
        $conn->query("

            SELECT sp.id

            FROM supplier_products sp

            INNER JOIN suppliers s
            ON sp.supplier_id = s.id

            WHERE sp.product_id = '{$row['id']}'

            AND s.user_id = '$user_id'

            LIMIT 1

        ");

    if (
        $check &&
        $check->num_rows > 0
    ) {

        $row['has_suppliers'] = 1;
    }

    //////////////////////////////////////////////////
    // SELLING OPTIONS
    //////////////////////////////////////////////////

    $row['selling_options'] = [];

    if (
        $row['inventory_type'] ===
        'measurable'
    ) {

        $options_result =
            $conn->query("

                SELECT

                    id,

                    label,

                    quantity,

                    price

                FROM product_selling_options

                WHERE product_id = '{$row['id']}'

                ORDER BY quantity ASC

            ");

        while (
            $option =
            $options_result->fetch_assoc()
        ) {

            $row['selling_options'][] =
                $option;
        }
    }

    //////////////////////////////////////////////////
    // ADD PRODUCT
    //////////////////////////////////////////////////

    $products[] = $row;
}

//////////////////////////////////////////////////
// RESPONSE
//////////////////////////////////////////////////

echo json_encode(
    $products
);

?>