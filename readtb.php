<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$servername = 'sql304.infinityfree.com';
$dbname = 'if0_37529066_timetable';
$username = 'if0_37529066';
$password = '6IdP7kpYa3VrXa';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("fail: " . $conn->connect_error);
}

$sql = "SELECT id, subject, day, teacher, time FROM timetable";
$result = $conn->query($sql);

if (!$result) {
    die("mistake: " . $conn->error);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timetable Data</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Timetable Data</h1>
    <?php
    if ($result->num_rows > 0) {
        echo "<table>";
 
        echo "<tr><th>ID</th><th>Subject</th><th>Day</th><th>Teacher</th><th>Time</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row["id"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["subject"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["day"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["teacher"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["time"]) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "empty";
    }
    $conn->close();
    ?>
</body>
</html>