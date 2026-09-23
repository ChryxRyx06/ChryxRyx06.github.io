<?php
header("Content-Type: application/json");
require_once "conexion.php";

$sql = "SELECT codigo_cotizacion, cliente, evento, descripcion, servicios, monto, vigencia, estado FROM cotizaciones ORDER BY id DESC";
$result = $conn->query($sql);

$cotizaciones = array();

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $cotizaciones[] = $row;
    }
}

echo json_encode($cotizaciones);

$conn->close();
?>