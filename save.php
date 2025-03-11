<?php
// Database configuration
$servername = "sql304.infinityfree.com";
// Replace this with your database username
$username = "if0_37529066";
// Replace this with your database password
$password = "6IdP7kpYa3VrXa";
// Replace this with your database name
$dbname = "if0_37529066_timetable";

// Create a database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check if the database connection is successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get JSON data from the request body
$data = file_get_contents('php://input');
// Decode the JSON data into an associative array
$classes = json_decode($data, true);

// Check if valid course data is received
if (!empty($classes)) {
    // Prepare the SQL insert statement
    $stmt = $conn->prepare("INSERT INTO timetable (subject, day, time, teacher) VALUES (?, ?, ?, ?)");

    // Iterate through each course information
    foreach ($classes as $class) {
        // Get the course subject
        $subject = $class['subject'];
        // Get the day of the course
        $day = $class['day'];
        // Get the time of the course
        $time = $class['time'];
        // Get the teacher of the course
        $teacher = $class['teacher'];

        // Bind parameters to the SQL statement
        $stmt->bind_param("ssss", $subject, $day, $time, $teacher);

        // Execute the SQL insert statement
        if (!$stmt->execute()) {
            // If the insertion fails, return an error message and terminate the script
            echo json_encode(['status' => 'error', 'message' => 'Error inserting data: ' . $stmt->error]);
            exit;
        }
    }

    // Close the prepared statement
    $stmt->close();

    // Insertion is successful, return a success message
    echo json_encode(['status' => 'success', 'message' => 'Data saved successfully!']);
} else {
    // No valid data is received, return an error message
    echo json_encode(['status' => 'error', 'message' => 'No data received!']);
}

// Close the database connection
$conn->close();
?>