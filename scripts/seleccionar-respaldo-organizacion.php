<?php
declare(strict_types=1);

/**
 * Devuelve el respaldo fechado más reciente que contiene la estructura mínima
 * del organizador. Las fechas ISO de los nombres permiten orden lexicográfico.
 */
function seleccionarRespaldoOrganizacion(string $dataDir): ?string
{
    $patron = $dataDir . DIRECTORY_SEPARATOR . 'organizacion-respaldo-????-??-??.json';
    $candidatos = [];
    foreach (glob($patron) ?: [] as $respaldo) {
        if (
            preg_match(
                '/^organizacion-respaldo-(\d{4})-(\d{2})-(\d{2})\.json$/',
                basename($respaldo),
                $partes
            ) !== 1
            || !checkdate((int) $partes[2], (int) $partes[3], (int) $partes[1])
        ) {
            continue;
        }
        $candidatos[$partes[1] . '-' . $partes[2] . '-' . $partes[3]] = $respaldo;
    }
    krsort($candidatos, SORT_STRING);

    foreach ($candidatos as $respaldo) {
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

/**
 * Crea el live desde un temporal completo y nunca reemplaza uno ya existente.
 */
function restaurarRespaldoOrganizacion(string $respaldo, string $live): bool
{
    if (is_file($live)) {
        return false;
    }

    $temporal = tempnam(dirname($live), '.organizacion-live-');
    if ($temporal === false) {
        throw new RuntimeException('No se pudo crear el temporal para restaurar el organizador');
    }

    try {
        if (!copy($respaldo, $temporal)) {
            throw new RuntimeException('No se pudo copiar ' . basename($respaldo));
        }

        if (is_file($live)) {
            return false;
        }
        if (!rename($temporal, $live)) {
            throw new RuntimeException('No se pudo activar el respaldo restaurado');
        }
        $temporal = '';
        return true;
    } finally {
        if ($temporal !== '' && is_file($temporal)) {
            unlink($temporal);
        }
    }
}
