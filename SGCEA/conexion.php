<?php
// Configuración de credenciales por defecto de XAMPP
$host = "localhost";
$user = "root";
$password = "";
$database = "sgcea_db";

// Crear la conexión
$conn = new mysqli($host, $user, $password, $database);

// Configurar juego de caracteres a UTF-8
$conn->set_charset("utf8");

// Verificar si hay errores de conexión
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Error de conexión con la base de datos: " . $conn->connect_error
    ]));
}
?>