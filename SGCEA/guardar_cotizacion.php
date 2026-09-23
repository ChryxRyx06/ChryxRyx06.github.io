<?php
header("Content-Type: application/json");
require_once "conexion.php";

// Leer datos JSON enviados desde el JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $cliente = $data['cliente'];
    $evento = $data['evento'];
    $descripcion = $data['descripcion'];
    $servicios = implode(", ", $data['servicios']); // Convertir arreglo a texto
    $monto = $data['monto'];
    $vigencia = $data['vigencia'];
    $codigo = "COT-" . rand(100, 999);

    // Preparar la consulta SQL
    $stmt = $conn->prepare("INSERT INTO cotizaciones (codigo_cotizacion, cliente, evento, descripcion, servicios, monto, vigencia) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssds", $codigo, $cliente, $evento, $descripcion, $servicios, $monto, $vigencia);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Cotización guardada exitosamente con el código " . $codigo
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al guardar en la base de datos: " . $stmt->error
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
        "status" => "error",
        "message" => "No se recibieron datos válidos."
    ]);
}

$conn->close();
?>