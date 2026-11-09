const EspecialidadesList = ({
  items,
  loading,
  error,
  onEdit,
  onDelete,
  saving,
}) => {
  return (
    <section className="card table-card border-0">
      <div className="section-head mb-3">
        <h2 className="mb-1">Listado de especialidades</h2>
        <p className="mb-0 text-secondary">Catalogo disponible para la agenda del consultorio</p>
      </div>

      {loading && <p>Cargando especialidades...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>No hay especialidades para mostrar.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-responsive modern-table-wrap">
          <table className="table table-striped align-middle mb-0 modern-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((especialidad) => (
                <tr key={especialidad._id}>
                  <td>{especialidad.nombre}</td>
                  <td>{especialidad.descripcion || "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => onEdit(especialidad)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      type="button"
                      onClick={() => onDelete(especialidad._id)}
                      disabled={saving}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default EspecialidadesList;
