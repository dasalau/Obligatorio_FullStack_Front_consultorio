import { useEffect, useMemo, useState } from "react";

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

const TurnosFiltersBar = ({
  estado,
  fecha,
  onEstadoChange,
  onFechaChange,
  onClear,
}) => {
  const hasFilters = Boolean(estado || fecha);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (!fecha) return new Date();
    const [year, month, day] = fecha.split("-").map(Number);
    return new Date(year, month - 1, day || 1);
  });

  useEffect(() => {
    if (!fecha) return;
    const [year, month, day] = fecha.split("-").map(Number);
    setCalendarMonth(new Date(year, month - 1, day || 1));
  }, [fecha]);

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

  const handleDateTextChange = (value) => {
    const normalized = normalizeDateInput(value);
    onFechaChange(parseDateToIso(normalized));
  };

  const handleDateSelect = (dateValue) => {
    const isoDate = `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}`;
    onFechaChange(isoDate);
    setCalendarOpen(false);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "0.9rem",
        padding: "1rem 1.1rem",
        marginBottom: "1.25rem",
        borderRadius: "1.2rem",
        background: "#ffffff",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        boxShadow: "0 20px 35px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div style={{ minWidth: 220, flex: "1 1 220px" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#355569",
            marginBottom: "0.4rem",
            letterSpacing: "0.02em",
          }}
        >
          Estado
        </label>
        <select
          className="form-select"
          value={estado}
          onChange={onEstadoChange}
          style={{
            borderRadius: "0.85rem",
            border: "1px solid rgba(82, 97, 114, 0.18)",
            background: "#ffffff",
            color: "#1f2d3d",
            minHeight: "2.9rem",
            boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.02)",
          }}
        >
          <option value="">Todos</option>
          <option value="pendiente">pendiente</option>
          <option value="confirmado">confirmado</option>
          <option value="cancelado">cancelado</option>
          <option value="atendido">atendido</option>
        </select>
      </div>

      <div style={{ minWidth: 240, flex: "1 1 240px" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#355569",
            marginBottom: "0.4rem",
            letterSpacing: "0.02em",
          }}
        >
          Fecha
        </label>

        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            className="form-control"
            type="text"
            inputMode="numeric"
            placeholder="dd/mm/yyyy"
            value={formatDateForInput(fecha)}
            onChange={(event) => handleDateTextChange(event.target.value)}
            onBlur={(event) => handleDateTextChange(event.target.value)}
            style={{
              borderRadius: "0.85rem 0 0 0.85rem",
              border: "1px solid rgba(82, 97, 114, 0.18)",
              borderRight: "none",
              background: "#ffffff",
              minHeight: "2.9rem",
              boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.02)",
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
              boxShadow: "0 10px 18px rgba(15, 23, 42, 0.03)",
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
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          style={{
            minHeight: "2.9rem",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: "0.85rem",
            background: "#ffffff",
            color: "#1d3a4b",
            fontWeight: 600,
            padding: "0.7rem 1rem",
            boxShadow: "0 10px 18px rgba(15, 23, 42, 0.04)",
            cursor: "pointer",
          }}
        >
          Limpiar filtros
        </button>
      )}

      {calendarOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.6rem)",
            left: "auto",
            right: "0",
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

            <strong style={{ color: "#1d3a4b", textTransform: "capitalize" }}>
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
              const isSelected =
                fecha &&
                item.currentMonth &&
                item.date.getDate() === Number(fecha.slice(-2)) &&
                item.date.getMonth() === Number(fecha.slice(5, 7)) - 1 &&
                item.date.getFullYear() === Number(fecha.slice(0, 4));

              return (
                <button
                  key={`${item.date.toISOString()}-${index}`}
                  type="button"
                  onClick={() => handleDateSelect(item.date)}
                  style={{
                    border: "none",
                    borderRadius: "0.6rem",
                    padding: "0.5rem 0",
                    cursor: "pointer",
                    background: isSelected
                      ? "#123145"
                      : item.currentMonth
                        ? "#ffffff"
                        : "#f7f9fb",
                    color: isSelected
                      ? "#ffffff"
                      : item.currentMonth
                        ? "#1d3a4b"
                        : "#a0acb7",
                    fontWeight: isSelected ? 700 : 500,
                    transition: "all 0.15s ease",
                    boxShadow: isSelected
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
    </div>
  );
};

export default TurnosFiltersBar;
