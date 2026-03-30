<?php
require '../config/db.php';

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$db = (new DB())->connect();

try {
    $db->beginTransaction();

    // Validation
    if (empty($data['items'])) {
        throw new Exception("Cart is empty");
    }

    if ($data['total'] <= 0) {
        throw new Exception("Invalid total");
    }

    $receipt = "REC" . time();
    $total = $data['total'];
    $now = date("Y-m-d H:i:s");

    // Insert order
    $stmt = $db->prepare("
        INSERT INTO orders (receipt_no, total_amount, created_at, updated_at) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$receipt, $total, $now, $now]);

    $orderId = $db->lastInsertId();

    foreach ($data['items'] as $item) {

        // Validate qty
        if ($item['qty'] <= 0) {
            throw new Exception("Invalid quantity");
        }

        // Check product
        $check = $db->prepare("SELECT stock FROM products WHERE id=?");
        $check->execute([$item['id']]);
        $product = $check->fetch();

        if (!$product) {
            throw new Exception("Product not found");
        }

        // Stock validation
        if ($product['stock'] < $item['qty']) {
            throw new Exception("Stock not enough for product ID " . $item['id']);
        }

        // Insert order item
        $stmt = $db->prepare("
            INSERT INTO order_items 
            (order_id, product_id, qty, price, total, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $orderId,
            $item['id'],
            $item['qty'],
            $item['price'],
            $item['qty'] * $item['price'],
            $now,
            $now
        ]);

        // Update stock
        $stmt = $db->prepare("UPDATE products SET stock = stock - ? WHERE id=?");
        $stmt->execute([$item['qty'], $item['id']]);
    }

    $db->commit();

    echo json_encode([
        "status" => "success",
        "receipt" => $receipt
    ]);

} catch (Exception $e) {
    $db->rollBack();

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}