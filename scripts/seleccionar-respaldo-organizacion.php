<?php
declare(strict_types=1);

/**
 * Devuelve el respaldo fechado más reciente que contiene la estructura mínima
 * del organizador. Las fechas ISO de los nombres permiten orden lexicográfico.
 */
function seleccionarRespaldoOrganizacion(string $dataDir): ?string
{
    $patron = $dataDir . DIRECTORY_SEPARATOR . 'organizacion-respaldo-????-??-??.json';
    $respaldos = glob($patron) ?: [];
    rsort($respaldos, SORT_STRING);

    foreach ($respaldos as $respaldo) {
        $raw = file_get_contents($respaldo);
        if ($raw === false) {
            continue;
        }

        $datos = json_decode($raw, true);
        if (
            is_array($datos)
            && isset($datos['clientes'], $datos['tareas'])
            && is_array($datos['clientes'])
            && is_array($datos['tareas'])
        ) {
            return $respaldo;
        }
    }

    return null;
}
