export function EstadoCatalogoAdmin({ consulta }) {
    if (consulta.cargando) return <p role="status">Consultando Spring Boot…</p>;
    if (consulta.error) return <div role="alert" className="alert alert-warning">
        {consulta.error}{' '}
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={consulta.recargar}>Volver a consultar</button>
    </div>;
    return null;
}

export function AvisoEscriturasAdmin({ habilitada, soloTemporales = true }) {
    if (habilitada && !soloTemporales) return null;
    return <p className="alert alert-info">
        {habilitada ? 'Modo de prueba activo. Solo se pueden escribir registros temporales autorizados (TEST-).' :
            'Catálogo conectado en modo lectura. Las escrituras administrativas están deshabilitadas.'}
    </p>;
}

export function ErroresFormularioAdmin({ error, etiquetas = {} }) {
    if (!error) return null;
    const campos = Object.entries(error.campos ?? {}).filter(([campo]) => Object.hasOwn(etiquetas, campo));
    return <div className="alert alert-danger" role="alert">
        {error.mensaje}
        {campos.length > 0 && <ul className="mb-0">{campos.map(([campo, detalle]) =>
            <li key={campo}>{etiquetas[campo]} · {detalle}</li>)}</ul>}
    </div>;
}
