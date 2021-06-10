<?php
$data = json_decode(file_get_contents('php://input'));
$db = mysqli_connect("localhost", "root", "root", "test");
if (!$db) {
    die("Не удалось соединиться:" . mysqli_error($db));
}
else {
    $name = $data->name;
    $email = $data->email;
    $message = $data->message;
    $name = mysqli_real_escape_string($db, htmlspecialchars(strip_tags($name)));
    $email = mysqli_real_escape_string($db, htmlspecialchars(strip_tags($email)));
    $message = mysqli_real_escape_string($db, htmlspecialchars(strip_tags($message)));

    $selectInsert = mysqli_query($db, "INSERT INTO `messages` (`name`, `email`, `message`) 
VALUES ('{$name}', '{$email}','{$message}')");
    if($selectInsert) {
        $select = mysqli_query($db, "SELECT * FROM `messages` WHERE id>0");
        if($select) {
            foreach ($select as $user) {
                $response[]=$user;
            }
        }
        else {
            die("Не удалось получить сообщения:" . mysqli_error($db));
        }
    }
    else {
        die("Не удалось добавить сообщение:" . mysqli_error($db));
    }
}
header("Content-type: application/json");
echo json_encode($response);

?>