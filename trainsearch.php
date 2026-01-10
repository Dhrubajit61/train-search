<?php
// Allow CORS (important)
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

// Validate input
if (!isset($_GET['trainNo'])) {
    http_response_code(400);
    echo "trainNo is required";
    exit;
}

$trainNo = preg_replace('/[^0-9]/', '', $_GET['trainNo']);

$url = "https://www.confirmtkt.com/train-schedule/" . $trainNo;

// Use cURL (more reliable than file_get_contents)
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_USERAGENT => "Mozilla/5.0",
    CURLOPT_TIMEOUT => 15,
]);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(500);
    echo "Failed to fetch route";
    exit;
}

curl_close($ch);

// Return raw HTML
echo $response;
