<?php
require '../config/db.php';

header("Content-Type: application/json");

$db = (new DB())->connect();

$stmt = $db->prepare("SELECT * FROM orders ORDER BY id DESC");
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));