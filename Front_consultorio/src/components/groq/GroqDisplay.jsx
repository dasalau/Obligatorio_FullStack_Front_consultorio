import { useSelector } from "react-redux";

const GroqDisplay = () => {
  const respuesta = useSelector((state) => state.groq.respuesta);

  return (
    <div className="card section-card border-0">
      <div className="section-head">
        <h2 className="mb-1">Respuesta</h2>
      </div>

      <div className="bg-light rounded p-3 border">
        {respuesta ? (
          <p className="mb-0 whitespace-pre-wrap">{respuesta}</p>
        ) : (
          <p className="mb-0 text-secondary">
            La respuesta de la consulta aparecerá aquí.
          </p>
        )}
      </div>
    </div>
  );
};

export default GroqDisplay;
