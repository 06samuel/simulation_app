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

// Check database connection
if(!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

// Initialize apartment object
$apartment = new Apartment($db);

// Query apartments
try {
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
                "name" => htmlspecialchars($name),
                "location" => htmlspecialchars($location),
                "price" => $price,
                "status" => htmlspecialchars($status),
                "description" => htmlspecialchars($description),
                "image_url" => htmlspecialchars($image_url),
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
        echo json_encode(["message" => "No apartments found."]);
    }
} catch(Exception $e) {
    // Set response code - 500 server error
    http_response_code(500);
    
    // Log the error
    error_log("Database error: " . $e->getMessage());
    
    // Return generic error message
    echo json_encode(["message" => "An error occurred while processing your request."]);
}
?>