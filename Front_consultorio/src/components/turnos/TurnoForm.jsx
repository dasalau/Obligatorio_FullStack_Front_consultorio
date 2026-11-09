import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { searchPacientes } from "../../features/pacientes/pacientes.slice";
import {
  horasDisponibles,
  turnoSchema,
  estadosTurnos,
} from "../../validators/turnos.validators";

const formatDateForInput = (value) => {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  }

  return value;
};

const normalizeDateInput = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (!digits) return "";

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

const parseDateToIso = (displayValue) => {
  const trimmed = displayValue.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";

  const [, dayRaw, monthRaw, yearRaw] = match;
  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);

  if (!year || !month || !day) return "";

  const parsedDate = new Date(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const getMonthDaysGrid = (year, month) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    cells.push({
      day: prevMonthDays - index,
      currentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - index),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      currentMonth: true,
      date: new Date(year, month, day),
    });
  }

  while (cells.length % 7 !== 0) {
    const nextIndex = cells.length - (firstWeekday + daysInMonth) + 1;
    cells.push({
      day: nextIndex,
      currentMonth: false,
      date: new Date(year, month + 1, nextIndex),
    });
  }

  return cells;
};

const getPacienteLabel = (paciente) => {
  if (!paciente) return "";
  const nombreCompleto =
    `${paciente.nombre || ""} ${paciente.apellido || ""}`.trim();
  const cedula = paciente.cedula ? ` (${paciente.cedula})` : "";
  return `${nombreCompleto}${cedula}`;
};

const getEspecialidadLabel = (especialidad) => especialidad?.nombre || "";

const emptyTurnoForm = {
  fecha: "",
  hora: "",
  motivo: "",
  estado: "pendiente",
  paciente: "",
  especialidad: "",
};

const TurnoForm = ({
  onSubmit,
  loading,
  especialidades,
  onCancel,
  error,
  editingId,
  initialValues = emptyTurnoForm,
}) => {
  const dispatch = useDispatch();
  const { searchResults: pacientes, searchLoading } = useSelector(
    (state) => state.pacientes,
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: editingId ? undefined : joiResolver(turnoSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });

  const fechaValue = watch("fecha") || "";
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (!fechaValue) return new Date();
    const [year, month, day] = fechaValue.split("-").map(Number);
    return new Date(year, month - 1, day || 1);
  });

  const [pacienteBusqueda, setPacienteBusqueda] = useState(
    initialValues.pacienteLabel || "",
  );
  const [especialidadBusqueda, setEspecialidadBusqueda] = useState(
    initialValues.especialidadLabel || "",
  );
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState(
    initialValues.paciente || "",
  );
  const [especialidadSeleccionadaId, setEspecialidadSeleccionadaId] = useState(
    initialValues.especialidad || "",
  );

  useEffect(() => {
    reset(initialValues);

    setPacienteBusqueda(initialValues.pacienteLabel || "");
    setEspecialidadBusqueda(initialValues.especialidadLabel || "");
    setPacienteSeleccionadoId(initialValues.paciente || "");
    setEspecialidadSeleccionadaId(initialValues.especialidad || "");
  }, [initialValues, reset]);

  useEffect(() => {
    if (!fechaValue) return;

    const [year, month, day] = fechaValue.split("-").map(Number);
    setCalendarMonth(new Date(year, month - 1, day || 1));
  }, [fechaValue]);

  useEffect(() => {
    const query = pacienteBusqueda.trim();
    if (!query || pacienteSeleccionadoId) {
      return;
    }

    const timeoutId = setTimeout(() => {
      dispatch(searchPacientes({ q: query, limite: 8 }));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [pacienteBusqueda, pacienteSeleccionadoId, dispatch]);

  const pacientesFiltrados = useMemo(() => {
    if (!pacienteBusqueda.trim()) return [];
    return pacientes || [];
  }, [pacienteBusqueda, pacientes]);

  const especialidadesFiltradas = useMemo(() => {
    const query = especialidadBusqueda.trim().toLowerCase();
    if (!query) return especialidades.slice(0, 8);

    return especialidades
      .filter((especialidad) =>
        getEspecialidadLabel(especialidad).toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [especialidadBusqueda, especialidades]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        month: "long",
        year: "numeric",
      }).format(calendarMonth),
    [calendarMonth],
  );

  const weekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const monthDays = useMemo(
    () =>
      getMonthDaysGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth],
  );

  const handleFechaTextChange = (value) => {
    const normalized = normalizeDateInput(value);
    const isoDate = parseDateToIso(normalized);
    setValue("fecha", isoDate, { shouldValidate: true, shouldDirty: true });
  };

  const handleFechaSelect = (dateValue) => {
    const isoDate = `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}`;
    setValue("fecha", isoDate, { shouldValidate: true, shouldDirty: true });
    setCalendarOpen(false);
  };

  const submitForm = async (values) => {
    const result = await onSubmit(values);

    if (result) {
      reset(emptyTurnoForm);
      setPacienteBusqueda("");
      setEspecialidadBusqueda("");
      setPacienteSeleccionadoId("");
      setEspecialidadSeleccionadaId("");
    }
  };

  return (
    <form
      className="card form-card section-card border-0"
      onSubmit={handleSubmit(submitForm)}
    >
      <h2>{editingId ? "Editar turno" : "Nuevo turno"}</h2>

      <div className="form-grid">
        <div className="form-field" style={{ position: "relative" }}>
          <label htmlFor="turno-fecha">Fecha</label>
          <input type="hidden" {...register("fecha")} />
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              id="turno-fecha"
              className="form-control"
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/yyyy"
              value={formatDateForInput(fechaValue)}
              onChange={(event) => handleFechaTextChange(event.target.value)}
              onBlur={(event) => handleFechaTextChange(event.target.value)}
              style={{
                borderRadius: "0.85rem 0 0 0.85rem",
                border: "1px solid rgba(82, 97, 114, 0.18)",
                borderRight: "none",
                background: "#ffffff",
                minHeight: "2.9rem",
              }}
            />

            <button
              type="button"
              aria-label="Seleccionar fecha"
              onClick={() => setCalendarOpen((value) => !value)}
              style={{
                minHeight: "2.9rem",
                width: "2.9rem",
                border: "1px solid rgba(82, 97, 114, 0.18)",
                borderRadius: "0 0.85rem 0.85rem 0",
                background: "linear-gradient(135deg, #ffffff 0%, #f3f7fb 100%)",
                color: "#516674",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 2.75V5.25M17 2.75V5.25M3.75 9.25H20.25M5.25 5.25H18.75C19.9926 5.25 21 6.25736 21 7.5V18C21 19.2426 19.9926 20.25 18.75 20.25H5.25C4.00736 20.25 3 19.2426 3 18V7.5C3 6.25736 4.00736 5.25 5.25 5.25Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {calendarOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 0.6rem)",
                left: 0,
                width: 310,
                background: "#ffffff",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                borderRadius: "1rem",
                boxShadow: "0 22px 40px rgba(15, 23, 42, 0.1)",
                padding: "0.9rem",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  style={{
                    border: "none",
                    background: "#f4f7fb",
                    borderRadius: "0.5rem",
                    width: "2rem",
                    height: "2rem",
                    cursor: "pointer",
                    color: "#23415d",
                    fontWeight: 700,
                  }}
                >
                  ‹
                </button>

                <strong
                  style={{ color: "#1d3a4b", textTransform: "capitalize" }}
                >
                  {monthLabel}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  style={{
                    border: "none",
                    background: "#f4f7fb",
                    borderRadius: "0.5rem",
                    width: "2rem",
                    height: "2rem",
                    cursor: "pointer",
                    color: "#23415d",
                    fontWeight: 700,
                  }}
                >
                  ›
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: "0.35rem",
                  marginBottom: "0.7rem",
                }}
              >
                {weekdayLabels.map((day) => (
                  <div
                    key={day}
                    style={{
                      textAlign: "center",
                      fontSize: "0.72rem",
                      color: "#6c7d8a",
                      fontWeight: 700,
                      padding: "0.3rem 0",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: "0.35rem",
                }}
              >
                {monthDays.map((item, index) => {
                  const selectedDate =
                    fechaValue &&
                    item.currentMonth &&
                    item.date.getDate() === Number(fechaValue.slice(-2)) &&
                    item.date.getMonth() ===
                      Number(fechaValue.slice(5, 7)) - 1 &&
                    item.date.getFullYear() === Number(fechaValue.slice(0, 4));

                  return (
                    <button
                      key={`${item.date.toISOString()}-${index}`}
                      type="button"
                      onClick={() => handleFechaSelect(item.date)}
                      style={{
                        border: "none",
                        borderRadius: "0.6rem",
                        padding: "0.5rem 0",
                        cursor: "pointer",
                        background: selectedDate
                          ? "#123145"
                          : item.currentMonth
                            ? "#ffffff"
                            : "#f7f9fb",
                        color: selectedDate
                          ? "#ffffff"
                          : item.currentMonth
                            ? "#1d3a4b"
                            : "#a0acb7",
                        fontWeight: selectedDate ? 700 : 500,
                        boxShadow: selectedDate
                          ? "0 10px 18px rgba(18, 49, 69, 0.18)"
                          : "none",
                      }}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {errors.fecha && <small>{errors.fecha.message}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="turno-hora">Hora</label>
          <select id="turno-hora" className="form-select" {...register("hora")}>
            <option value="">Seleccione una hora</option>
            {horasDisponibles.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
          {errors.hora && <small>{errors.hora.message}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="turno-estado">Estado</label>
          <select
            id="turno-estado"
            className="form-select"
            {...register("estado")}
          >
            {estadosTurnos.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="turno-especialidad">Especialidad</label>
          <input
            id="turno-especialidad"
            type="text"
            className="form-control"
            placeholder="Buscar especialidad"
            value={especialidadBusqueda}
            onChange={(event) => {
              const nextValue = event.target.value;
              setEspecialidadBusqueda(nextValue);
              setEspecialidadSeleccionadaId("");
              setValue("especialidad", "", {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            autoComplete="off"
          />
          <input type="hidden" {...register("especialidad")} />
          {!especialidadSeleccionadaId &&
            especialidadBusqueda &&
            especialidadesFiltradas.length > 0 && (
              <div className="search-suggestion-list">
                {especialidadesFiltradas.map((especialidad) => (
                  <button
                    key={especialidad._id}
                    type="button"
                    className="search-suggestion-item"
                    onClick={() => {
                      setEspecialidadBusqueda(
                        getEspecialidadLabel(especialidad),
                      );
                      setEspecialidadSeleccionadaId(especialidad._id);
                      setValue("especialidad", especialidad._id, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  >
                    {getEspecialidadLabel(especialidad)}
                  </button>
                ))}
              </div>
            )}
          {errors.especialidad && <small>{errors.especialidad.message}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="turno-paciente">Paciente</label>
          <input
            id="turno-paciente"
            type="text"
            className="form-control"
            placeholder="Buscar paciente por nombre o cedula"
            value={pacienteBusqueda}
            onChange={(event) => {
              const nextValue = event.target.value;
              setPacienteBusqueda(nextValue);
              setPacienteSeleccionadoId("");
              setValue("paciente", "", {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            autoComplete="off"
          />
          <input type="hidden" {...register("paciente")} />
          {!pacienteSeleccionadoId && pacienteBusqueda && (
            <div className="search-suggestion-list">
              {searchLoading ? (
                <span className="search-suggestion-empty">
                  Buscando paciente...
                </span>
              ) : pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((paciente) => (
                  <button
                    key={paciente._id}
                    type="button"
                    className="search-suggestion-item"
                    onClick={() => {
                      setPacienteBusqueda(getPacienteLabel(paciente));
                      setPacienteSeleccionadoId(paciente._id);
                      setValue("paciente", paciente._id, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  >
                    {getPacienteLabel(paciente)}
                  </button>
                ))
              ) : (
                <span className="search-suggestion-empty">
                  No se encontraron pacientes
                </span>
              )}
            </div>
          )}
          {errors.paciente && <small>{errors.paciente.message}</small>}
        </div>

        <div className="form-field form-field-full">
          <label htmlFor="turno-motivo">Motivo</label>
          <textarea
            id="turno-motivo"
            className="form-control form-textarea"
            rows={4}
            {...register("motivo")}
          />
          {errors.motivo && <small>{errors.motivo.message}</small>}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="actions-row">
        <button
          className="btn btn-success"
          type="submit"
          disabled={loading || (!editingId && !isValid)}
        >
          {loading
            ? "Guardando..."
            : editingId
              ? "Actualizar turno"
              : "Crear turno"}
        </button>
        {onCancel && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default TurnoForm;
