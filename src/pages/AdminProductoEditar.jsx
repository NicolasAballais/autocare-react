import { useParams } from 'react-router-dom';
import FormularioAdminProducto from '../components/FormularioAdminProducto.jsx';

export default function AdminProductoEditar(props) {
    const { id } = useParams();
    return <FormularioAdminProducto {...props} id={id} />;
}
