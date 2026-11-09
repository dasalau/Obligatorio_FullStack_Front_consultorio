import { useEffect, useState } from "react";
import api from "../../api/api";

const TurnosTable = ({ turnos, onDelete, onInlineUpdate, onEdit, loading }) => {
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [pacienteHistory, setPacienteHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!selectedTurno?.paciente?._id) {
      setPacienteHistory([]);
      return;
    }

    const fetchPacienteHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data } = await api.get(
          `/turnos/paciente/${selectedTurno.paciente._id}`,
        );
        const history = (data?.turnos || []).filter(
          (turno) => turno._id !== selectedTurno._id,
        );
        setPacienteHistory(history);
      } catch (error) {
        setPacienteHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPacienteHistory();
  }, [selectedTurno]);

  const formatDate = (value) => {
    if (!value) return "Sin dato";

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      const formattedDay = String(localDate.getDate()).padStart(2, "0");
      const formattedMonth = localDate.toLocaleString("es-ES", {
        month: "short",
      });
      return `${formattedDay}-${formattedMonth}-${localDate.getFullYear()}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("es-ES", { month: "short" });
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <>
      {selectedTurno && (
        <div
          className="turno-detail-backdrop"
          onClick={() => setSelectedTurno(null)}
        >
          <div
            className="card turno-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="turno-detail-header">
              <div>
                <p className="turno-detail-label">Turno</p>
                <h3>
                  {formatDate(selectedTurno.fecha)} · {selectedTurno.hora}
                </h3>
              </div>
              <button
                className="btn btn-sm btn-outline-secondary"
                type="button"
                onClick={() => setSelectedTurno(null)}
              >
                Cerrar
              </button>
            </div>

            <div className="turno-detail-grid">
              <div className="turno-detail-box">
                <span>Paciente</span>
                <strong>
                  {selectedTurno.paciente?.nombre &&
                  selectedTurno.paciente?.apellido
                    ? `${selectedTurno.paciente.nombre} ${selectedTurno.paciente.apellido}`
                    : selectedTurno.paciente?._id || "-"}
                </strong>
              </div>

              <div className="turno-detail-box">
                <span>Cedula</span>
                <strong>
                  {selectedTurno.paciente?.cedula || "Sin cedula"}
                </strong>
              </div>

              <div className="turno-detail-box">
                <span>Especialidad</span>
                <strong>
                  {selectedTurno.especialidad?.nombre ||
                    selectedTurno.especialidad?._id ||
                    "-"}
                </strong>
              </div>

              <div className="turno-detail-box">
                <span>Profesional asignado</span>
                <strong>
                  {selectedTurno.profesional?.nombre &&
                  selectedTurno.profesional?.apellido
                    ? `${selectedTurno.profesional.nombre} ${selectedTurno.profesional.apellido}`
                    : selectedTurno.createdBy?.nombre &&
                        selectedTurno.createdBy?.apellido
                      ? `${selectedTurno.createdBy.nombre} ${selectedTurno.createdBy.apellido}`
                      : selectedTurno.profesional?.username ||
                        selectedTurno.createdBy?.username ||
                        selectedTurno.profesional ||
                        "No asignado"}
                </strong>
              </div>

              <div className="turno-detail-box">
                <span>Fecha</span>
                <strong>
                  {formatDate(selectedTurno.fecha) || "Sin fecha"}
                </strong>
              </div>

              <div className="turno-detail-box">
                <span>Hora</span>
                <strong>{selectedTurno.hora || "Sin hora"}</strong>
              </div>

              <div className="turno-detail-box">
                <span>Fecha de creacion</span>
                <strong>
                  {formatDate(
                    selectedTurno.createdAt || selectedTurno.created_at,
                  )}
                </strong>
              </div>

              <div className="turno-detail-box">
                <span>Estado</span>
                <strong>{selectedTurno.estado || "pendiente"}</strong>
              </div>

              <div className="turno-detail-box turno-detail-box-full">
                <span>Motivo</span>
                <p>{selectedTurno.motivo || "Sin motivo registrado"}</p>
              </div>

              <div className="turno-detail-box turno-detail-box-full">
                <span>Historial del paciente</span>
                {historyLoading ? (
                  <p>Cargando historial...</p>
                ) : pacienteHistory.length > 0 ? (
                  <ul className="turno-patient-history">
                    {pacienteHistory.map((item) => (
                      <li key={item._id} className="turno-history-item">
                        <div className="turno-history-main">
                          <span className="turno-history-date">
                            {formatDate(item.fecha)} · {item.hora}
                          </span>
                          <small className="turno-history-specialty">
                            {item.especialidad?.nombre || "Especialidad"}
                          </small>
                        </div>
                        <span
                          className={`turno-history-status turno-history-status-${
                            item.estado || "pendiente"
                          }`}
                        >
                          {item.estado || "pendiente"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Sin otros turnos registrados</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="card table-card border-0">
        <div className="section-head mb-3">
          <h2 className="mb-1">Listado de turnos</h2>
          <p className="mb-0 text-secondary">
            Detalle con acciones rapidas por estado
          </p>
        </div>

        {loading && <p>Cargando turnos...</p>}

        {!loading && turnos.length === 0 && <p>No hay turnos para mostrar.</p>}

        {!loading && turnos.length > 0 && (
          <div className="table-responsive modern-table-wrap">
            <table className="table table-striped align-middle mb-0 modern-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Paciente</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((turno) => {
                  const pacienteNombre =
                    turno.paciente?.nombre && turno.paciente?.apellido
                      ? `${turno.paciente.nombre} ${turno.paciente.apellido}`
                      : turno.paciente?._id || "-";

                  return (
                    <tr
                      key={turno._id}
                      onClick={() => setSelectedTurno(turno)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{formatDate(turno.fecha)}</td>
                      <td>{turno.hora}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          defaultValue={turno.estado}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => {
                            event.stopPropagation();
                            onInlineUpdate(turno._id, {
                              estado: event.target.value,
                            });
                          }}
                        >
                          <option value="pendiente">pendiente</option>
                          <option value="confirmado">confirmado</option>
                          <option value="cancelado">cancelado</option>
                          <option value="atendido">atendido</option>
                        </select>
                      </td>
                      <td>{pacienteNombre}</td>
                      <td>
                        <div className="table-action-stack">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit?.(turno);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDelete(turno._id);
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default TurnosTable;
