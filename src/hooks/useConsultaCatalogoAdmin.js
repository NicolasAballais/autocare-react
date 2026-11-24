import { useEffect, useState } from 'react';
import { mensajeErrorAdmin } from '../services/adminCatalogoApi.js';

export function useConsultaCatalogoAdmin(conectado, consultar, id) {
    const [intento, setIntento] = useState(0);
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        if (!conectado) return;
        let vigente = true;
        consultar(id).then((datos) => {
            if (vigente) setResultado({ consultar, id, intento, datos });
        }).catch((causa) => {
            if (vigente) setResultado({ consultar, id, intento, error: mensajeErrorAdmin(causa) });
        });
        return () => { vigente = false; };
    }, [conectado, consultar, id, intento]);

    const actual = resultado?.consultar === consultar && resultado.id === id && resultado.intento === intento
        ? resultado : null;
    return { datos: actual?.datos, error: actual?.error, cargando: conectado && !actual,
        recargar: () => setIntento((anterior) => anterior + 1) };
}
