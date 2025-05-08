<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and user model
include_once '../config/database.php';
include_once '../models/user.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate user object
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if(
    !empty($data->username) &&
    !empty($data->password)
) {
    // Set user property values
    $user->username = $data->username;
    $passwordInput = $data->password;

    // Check if username exists and password is correct
    if($user->usernameExists() && password_verify($passwordInput, $user->password)) {
        // Create array
        $user_arr = array(
            "id" => $user->id,
            "username" => $user->username,
            "email" => $user->email,
            "role" => $user->role
        );

        // Set response code - 200 OK
        http_response_code(200);

        // Generate JWT
        $token = bin2hex(random_bytes(32)); // Simple token for now, consider JWT for production

        // Return token and user data
        echo json_encode(array(
            "message" => "Login successful.",
            "token" => $token,
            "user" => $user_arr
        ));
    } else {
        // Set response code - 401 Unauthorized
        http_response_code(401);

        // Tell the user login failed
        echo json_encode(array("message" => "Login failed. Invalid username or password."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user data is incomplete
    echo json_encode(array("message" => "Unable to login. Data is incomplete."));
}
?>