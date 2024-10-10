<?php
// Database connection credentials
$host = 'epscidb';
$dbname = 'msaiworkshop';
$username = 'msuser';
$password = ''; // Replace with your actual password

//get ip address of client
$ip = $_SERVER['REMOTE_ADDR'];

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve and sanitize POST data
    $player_token = isset($_POST['player_token']) ? $_POST['player_token'] : null;
    $score = isset($_POST['score']) ? $_POST['score'] : null;
    $method = isset($_POST['method']) ? $_POST['method'] : null;
    $tt = isset($_POST['traintime']) ? $_POST['traintime'] : -1;
    $na = isset($_POST['netarch']) ? $_POST['netarch'] : "";

    // Check if player_token starts with 'tbritton'
    if ($player_token && strpos($player_token, 'msaiwk24') === 0 ) {
        // Validate that score is a numeric value
        if (is_numeric($score) && $method) {
            // Connect to the database using mysqli_connect
            $conn = mysqli_connect($host, $username, $password, $dbname);

            // Check connection
            if (!$conn) {
                die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . mysqli_connect_error()]));
            }

            // Prepare the INSERT query with placeholders
            $query = "INSERT INTO Scores (datetime, Name, Score, Mode,IP,TrainingTime,Arch) VALUES (NOW(), ?, ?, ?,?,?,?)";
            $stmt = mysqli_prepare($conn, $query);

            if ($stmt) {
                // Bind the parameters to the query
                mysqli_stmt_bind_param($stmt, 'sissis', $player_token, $score, $method,$ip,$tt,$na); // 'sis' -> string, integer, string

                // Execute the query
                if (mysqli_stmt_execute($stmt)) {
                    // Respond with a success message
                    echo json_encode(['status' => 'success', 'message' => 'Score recorded successfully']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to record score']);
                }

                // Close the statement
                mysqli_stmt_close($stmt);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare query']);
            }

            // Close the database connection
            mysqli_close($conn);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid score or method']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid player token']);
    }
} else {
    // Respond with an error if the request method is not POST
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
return 0;
?>
