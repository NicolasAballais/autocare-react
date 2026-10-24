import blogs from '../data/blogs.json';

export function obtenerBlogs() {
    return blogs;
}

export function obtenerBlogPorId(id) {
    return blogs.find(
        (blog) => blog.id === Number(id)
    ) || null;
}
