import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="page">
      <section className="card">
        <h1>404</h1>
        <p>Pagina no encontrada</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    </main>
  );
};

export default NotFoundPage;
