<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database, model, and auth middleware
include_once '../config/database.php';
include_once '../models/apartment.php';
include_once '../config/auth_middleware.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate auth middleware
$auth = new AuthMiddleware($db);

// Check if user is authenticated
if (!$auth->validateToken()) {
    // Set response code - 401 Unauthorized
    http_response_code(401);
    
    // Tell the user access denied
    echo json_encode(array("message" => "Access denied. Authentication required."));
    exit;
}

// Instantiate apartment object
$apartment = new Apartment($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if(
    !empty($data->name) &&
    !empty($data->location) &&
    !empty($data->price) &&
    !empty($data->status)
) {
    // Set apartment property values
    $apartment->name = $data->name;
    $apartment->location = $data->location;
    $apartment->price = $data->price;
    $apartment->status = $data->status;
    $apartment->description = $data->description ?? "";
    $apartment->image_url = $data->image_url ?? "";

    // Create the apartment
    if($apartment->create()) {
        // Set response code - 201 created
        http_response_code(201);

        // Tell the user
        echo json_encode(array("message" => "Apartment was created.", "success" => true));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to create apartment.", "success" => false));
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to create apartment. Data is incomplete.", "success" => false));
}
?>