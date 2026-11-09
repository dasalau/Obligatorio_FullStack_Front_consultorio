const UsageCard = ({ planCode, totalTurnos }) => {
  const isPlus = planCode === "plus";
  const used = totalTurnos || 0;
  const percentage = isPlus
    ? Math.min(100, Math.round((Math.min(used, 4) / 4) * 100))
    : null;

  return (
    <section className="card section-card border-0">
      <div className="section-head">
        <h2 className="mb-1">Informe de uso</h2>
        <p className="mb-2 text-secondary">Consumo de turnos segun plan</p>
      </div>

      {isPlus ? (
        <>
          <p>Plan plus: {used} de 4 turnos usados.</p>
          <div className="usage-bar">
            <div
              className="usage-fill"
              style={{ width: `${percentage}%` }}
              aria-label={`Uso ${percentage}%`}
            />
          </div>
          <p>{percentage}% utilizado</p>
        </>
      ) : (
        <p>Plan premium: {used} turnos registrados.</p>
      )}
    </section>
  );
};

export default UsageCard;
