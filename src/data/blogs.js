export const blogs = [
    {
        id: 1,
        titulo: '5 consejos para cuidar tu vehículo',
        resumen:
            'Mantener tu automóvil en buenas condiciones ayuda a prolongar su vida útil y evitar reparaciones costosas.',
        imagen: '/images/Tienda.png',
        contenido: [
            'El mantenimiento preventivo es fundamental para conservar un vehículo en buenas condiciones y reducir el riesgo de fallas inesperadas.',
            'Revisar periódicamente el nivel de aceite, el estado de los neumáticos, los filtros, las luces y los distintos líquidos del vehículo puede prevenir problemas mayores.',
            'También es importante respetar los períodos de mantenimiento recomendados y utilizar productos adecuados para cada componente del automóvil.',
            'En AutoCarePro buscamos facilitar el acceso a productos que permitan realizar tareas básicas de mantención y cuidado de forma segura y sencilla.'
        ]
    },

    {
        id: 2,
        titulo: '¿Por qué es importante cambiar el aceite?',
        resumen:
            'El aceite cumple una función esencial en el motor. Conoce por qué es importante realizar su cambio periódicamente.',
        imagen: '/images/Aceite.png',
        contenido: [
            'El aceite del motor permite lubricar sus piezas internas y disminuir la fricción producida durante el funcionamiento del vehículo.',
            'Con el uso y el paso del tiempo, el aceite pierde propiedades y acumula residuos, reduciendo progresivamente su capacidad de protección.',
            'Realizar el cambio de aceite en los intervalos correspondientes ayuda a disminuir el desgaste del motor y contribuye a mantener un funcionamiento adecuado.',
            'Además del aceite, es recomendable revisar periódicamente el filtro correspondiente, ya que ambos elementos trabajan en conjunto para proteger el motor.'
        ]
    }
];


export function obtenerBlogs() {
    return blogs;
}


export function obtenerBlogPorId(id) {

    return blogs.find(
        (blog) =>
            blog.id === Number(id)
    ) || null;
}