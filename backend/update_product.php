<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = (int)$data['id'];
$user_id = (int)$data['user_id'];

$name = trim($data['name'] ?? '');
$variant = trim($data['variant'] ?? '');
$brand = trim($data['brand'] ?? '');

$inventory_type = trim($data['inventory_type'] ?? 'standard');
$base_unit = trim($data['base_unit'] ?? '');

$price = (float)($data['price'] ?? 0);
$stock = (float)($data['stock'] ?? 0);
$low_stock_limit = (float)($data['low_stock_limit'] ?? 5);

$selling_options = $data['selling_options'] ?? [];

if (!$id || !$name) {
    echo json_encode([
        "error" => "Invalid product data"
    ]);
    exit();
}

if ($price <= 0) {
    echo json_encode([
        "error" => "Price is required"
    ]);
    exit();
}

if (
    $inventory_type === 'measurable' &&
    !in_array($base_unit, ['kg', 'L'])
) {
    echo json_encode([
        "error" => "Base unit must be kg or L"
    ]);
    exit();
}

//////////////////////////////////////////////////
// DUPLICATE CHECK
//////////////////////////////////////////////////

$check = $conn->query("
    SELECT id
    FROM products
    WHERE user_id = '$user_id'
      AND name = '$name'
      AND IFNULL(variant, '') = '$variant'
      AND IFNULL(brand, '') = '$brand'
      AND id != '$id'
");

if ($check->num_rows > 0) {
    echo json_encode([
        "error" => "Same product already exists"
    ]);
    exit();
}

//////////////////////////////////////////////////
// UPDATE PRODUCT
//////////////////////////////////////////////////

$conn->query("
    UPDATE products
    SET
        name = '$name',
        variant = '$variant',
        brand = '$brand',
        inventory_type = '$inventory_type',
        base_unit = '$base_unit',
        price = '$price',
        stock = '$stock',
        low_stock_limit = '$low_stock_limit'
    WHERE id = '$id'
      AND user_id = '$user_id'
");

//////////////////////////////////////////////////
// RESET SELLING OPTIONS
//////////////////////////////////////////////////

$conn->query("
    DELETE FROM product_selling_options
    WHERE product_id = '$id'
");

if ($inventory_type === 'measurable') {

    foreach ($selling_options as $option) {

        $label = trim($option['label'] ?? '');
        $quantity = (float)($option['quantity'] ?? 0);
        $option_price = (float)($option['price'] ?? 0);

        if (!$label || $quantity <= 0 || $option_price <= 0) {
            continue;
        }

        $conn->query("
            INSERT INTO product_selling_options (
                product_id,
                label,
                quantity,
                price
            )
            VALUES (
                '$id',
                '$label',
                '$quantity',
                '$option_price'
            )
        ");
    }
}

echo json_encode([
    "message" => "Product updated successfully"
]);

?>