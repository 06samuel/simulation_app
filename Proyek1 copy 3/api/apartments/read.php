<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database and model files
include_once '../config/database.php';
include_once '../models/apartment.php';

// Instantiate database and apartment object
$database = new Database();
$db = $database->getConnection();

// Initialize apartment object
$apartment = new Apartment($db);

// Query apartments
$stmt = $apartment->read();
$num = $stmt->rowCount();

// Check if more than 0 record found
if($num > 0) {
    // Apartments array
    $apartments_arr = array();
    $apartments_arr["records"] = array();

    // Retrieve table contents
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $apartment_item = array(
            "id" => $id,
            "name" => $name,
            "location" => $location,
            "price" => $price,
            "status" => $status,
            "description" => $description,
            "image_url" => $image_url,
            "created_at" => $created_at,
            "updated_at" => $updated_at
        );

        array_push($apartments_arr["records"], $apartment_item);
    }

    // Set response code - 200 OK
    http_response_code(200);

    // Show apartments data in JSON format
    echo json_encode($apartments_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);

    // Tell the user no apartments found
    echo json_encode(array("message" => "No apartments found."));
}
?>