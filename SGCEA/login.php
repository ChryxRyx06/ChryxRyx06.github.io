<?php
// Permitir peticiones desde localhost y especificar JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Desactivar despliegue de errores de PHP en pantalla para no romper el JSON
error_reporting(0);
ini_set('display_errors', 0);

require_once "conexion.php";

// Leer datos enviados
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if ($data && isset($data['usuario']) && isset($data['password'])) {
    $correo = trim($data['usuario']);
    $password = trim($data['password']);

    // Verificar si la conexión falló
    if ($conn->connect_error) {
        echo json_encode([
            "status" => "error",
            "message" => "Error de conexión a MySQL: " . $conn->connect_error
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = ?");
    
    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => "Error en la consulta SQL. ¿Creaste la tabla 'usuarios'?"
        ]);
        exit;
    }

    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if ($password === $row['password']) {
            echo json_encode([
                "status" => "success",
                "message" => "Autenticación exitosa",
                "user" => [
                    "id" => $row['id'],
                    "nombre" => $row['nombre'],
                    "correo" => $row['correo'],
                    "rol" => $row['rol']
                ]
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Contraseña incorrecta."
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "El usuario no existe en la base de datos."
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
        "status" => "error",
        "message" => "No se recibieron credenciales válidas."
    ]);
}

$conn->close();
?>