import { useMemo, useState } from "react";

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

  const handleToggleCalendar = () => {
    if (calendarOpen) {
      setCalendarOpen(false);
      return;
    }

    if (fecha) {
      const [year, month, day] = fecha.split("-").map(Number);
      setCalendarMonth(new Date(year, month - 1, day || 1));
    } else {
      setCalendarMonth(new Date());
    }

    setCalendarOpen(true);
  };

  return (
    <div className="card border-0 section-card turnos-filters-bar">
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-6 col-lg-4">
          <label className="turnos-filter-label">
          Estado
          </label>
          <select className="form-select" value={estado} onChange={onEstadoChange}>
            <option value="">Todos</option>
            <option value="pendiente">pendiente</option>
            <option value="confirmado">confirmado</option>
            <option value="cancelado">cancelado</option>
            <option value="atendido">atendido</option>
          </select>
        </div>

        <div className="col-12 col-md-6 col-lg-4 turno-date-field">
          <label className="turnos-filter-label">
          Fecha
          </label>

          <div className="input-group turnos-date-input-group">
            <input
              className="form-control"
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/yyyy"
              value={formatDateForInput(fecha)}
              onChange={(event) => handleDateTextChange(event.target.value)}
              onBlur={(event) => handleDateTextChange(event.target.value)}
            />

            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-label="Seleccionar fecha"
              onClick={handleToggleCalendar}
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
            <div className="turnos-calendar-popover">
              <div className="turnos-calendar-head">
                <button
                  type="button"
                  className="turnos-calendar-nav"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                >
                  ‹
                </button>

                <strong className="turnos-calendar-month">{monthLabel}</strong>

                <button
                  type="button"
                  className="turnos-calendar-nav"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                >
                  ›
                </button>
              </div>

              <div className="turnos-calendar-weekdays">
                {weekdayLabels.map((day) => (
                  <div key={day} className="turnos-calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="turnos-calendar-grid">
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
                      className={`turnos-calendar-day ${item.currentMonth ? "" : "is-outside"} ${isSelected ? "is-selected" : ""}`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {hasFilters && (
          <div className="col-12 col-lg-4 d-grid d-lg-flex justify-content-lg-end">
            <button type="button" className="btn btn-outline-secondary" onClick={onClear}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default TurnosFiltersBar;
