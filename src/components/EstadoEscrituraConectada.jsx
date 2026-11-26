export default function EstadoEscrituraConectada({ escritura }) {
    return <>
        {!escritura.habilitada && <p className="alert alert-info">Las escrituras están deshabilitadas en este entorno.</p>}
        {escritura.error && <p className="alert alert-danger" role="alert">{escritura.error}</p>}
    </>;
}
