<?php
require '../config/db.php';

$db = (new DB())->connect();

$stmt = $db->prepare("SELECT * FROM products");
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));