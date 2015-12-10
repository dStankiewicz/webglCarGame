<?php
header("Content-Type: application/x-www-form-urlencoded");
$file = $_POST["file"];
$jsonData = file_get_contents($file);
echo $jsonData;
?>