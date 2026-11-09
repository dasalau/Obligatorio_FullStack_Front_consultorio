const PlanSwitchCard = ({ planCode, loading, onUpgrade }) => {
  return (
    <section className="card section-card border-0">
      <div className="section-head">
        <h2 className="mb-1">Plan de usuario</h2>
        <p className="mb-2 text-secondary">Gestion de suscripcion y mejoras</p>
      </div>
      <p>
        Plan actual: <strong>{planCode || "Cargando..."}</strong>
      </p>

      {planCode === "plus" ? (
        <button
          className="btn btn-success"
          onClick={onUpgrade}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Pasar a Premium"}
        </button>
      ) : (
        <p>Ya cuentas con plan premium.</p>
      )}
    </section>
  );
};

export default PlanSwitchCard;
