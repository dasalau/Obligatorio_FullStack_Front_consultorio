import { useEffect, useRef, useState } from "react";
import api from "../../api/api";

const PacientesList = ({
  items,
  loading,
  error,
  onEdit,
  onDelete,
  saving,
  selectedPaciente,
  onSelectPaciente,
  onClosePaciente,
  onPacienteUpdated,
}) => {
  const [internalSelectedPaciente, setInternalSelectedPaciente] =
    useState(null);
  const [pacienteHistory, setPacienteHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const fileInputRef = useRef(null);
  const dragStartRef = useRef(null);

  const activeSelectedPaciente = selectedPaciente ?? internalSelectedPaciente;

  useEffect(() => {
    setAiAnalysis("");
    setAiLoading(false);

    if (!activeSelectedPaciente?._id) {
      setPacienteHistory([]);
      return;
    }

    const fetchPacienteHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data } = await api.get(
          `/turnos/paciente/${activeSelectedPaciente._id}`,
        );
        setPacienteHistory(data?.turnos || []);
      } catch (error) {
        setPacienteHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPacienteHistory();
  }, [activeSelectedPaciente]);

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

  const getPacienteName = (paciente) => {
    if (!paciente) return "-";
    if (paciente.nombre && paciente.apellido) {
      return `${paciente.nombre} ${paciente.apellido}`;
    }
    return paciente._id || "-";
  };

  const buildAnonimizedHistory = (turnos) =>
    (turnos || []).map((turno, index) => ({
      consulta: index + 1,
      fecha: turno?.fecha || "sin fecha",
      hora: turno?.hora || "sin hora",
      especialidad: turno?.especialidad?.nombre || "sin especialidad",
      motivo: turno?.motivo || "sin motivo registrado",
      estado: turno?.estado || "pendiente",
    }));

  const getSafeTurnosForAnalysis = () => {
    const validTurnos = (pacienteHistory || []).filter(
      (turno) => (turno?.estado || "").toLowerCase() !== "cancelado",
    );

    if (!pacienteHistory?.length) {
      return {
        ok: false,
        reason:
          "No hay turnos registrados para este paciente. No se puede generar una evaluación ni una recomendación con información real.",
      };
    }

    if (!validTurnos.length) {
      return {
        ok: false,
        reason:
          "Todos los turnos registrados para este paciente están cancelados. No se puede inventar una evolución ni un plan de tratamiento sin información clínica disponible.",
      };
    }

    return { ok: true, turnos: validTurnos };
  };

  const formatAiText = (rawValue) => {
    if (!rawValue) return "Sin respuesta.";

    let text = String(rawValue).trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        const sections = [];

        const addSection = (label, value) => {
          if (!value && value !== 0) return;
          sections.push(`${label}:\n${value}`);
        };

        if (parsed.objetivoGeneral) {
          sections.push(`Objetivo general:\n${parsed.objetivoGeneral}`);
        }

        if (parsed.evaluacion) {
          sections.push(`Evaluación:\n${parsed.evaluacion}`);
        }

        if (parsed.etapasPropuestas && Array.isArray(parsed.etapasPropuestas)) {
          const etapas = parsed.etapasPropuestas
            .map((etapa, index) => {
              if (typeof etapa === "string") return `${index + 1}. ${etapa}`;
              if (typeof etapa === "object") {
                const title =
                  etapa.etapa || etapa.titulo || `Etapa ${index + 1}`;
                const descripcion = etapa.descripcion || etapa.texto || "";
                return `${index + 1}. ${title}${descripcion ? `: ${descripcion}` : ""}`;
              }
              return `${index + 1}. ${JSON.stringify(etapa)}`;
            })
            .join("\n");
          sections.push(`Etapas propuestas:\n${etapas}`);
        }

        if (parsed.planDeTratamiento) {
          if (typeof parsed.planDeTratamiento === "string") {
            sections.push(`Plan de tratamiento:\n${parsed.planDeTratamiento}`);
          } else if (typeof parsed.planDeTratamiento === "object") {
            const nested = Object.entries(parsed.planDeTratamiento)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}:\n${value
                    .map(
                      (item) =>
                        `- ${typeof item === "string" ? item : JSON.stringify(item)}`,
                    )
                    .join("\n")}`;
                }
                return `${key}: ${value}`;
              })
              .join("\n");
            sections.push(`Plan de tratamiento:\n${nested}`);
          }
        }

        if (parsed.recomendacion) {
          addSection("Recomendación", parsed.recomendacion);
        }

        if (parsed.observacion) {
          addSection("Observación", parsed.observacion);
        }

        if (!sections.length) {
          return JSON.stringify(parsed, null, 2);
        }

        return sections.join("\n\n");
      }
    } catch (error) {
      // Ignora el parse si no es JSON puro y deja el texto tal cual.
    }

    return text;
  };

  const cleanInlineText = (value) =>
    String(value || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();

  const isTableSeparator = (line) =>
    /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line.trim());

  const parseTableRow = (line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cleanInlineText(cell));

  const buildAiBlocks = (text) => {
    const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let index = 0;

    const pushParagraph = (content) => {
      const normalized = cleanInlineText(content);
      if (normalized) {
        blocks.push({ type: "paragraph", content: normalized });
      }
    };

    while (index < lines.length) {
      const rawLine = lines[index] ?? "";
      const line = rawLine.trim();

      if (!line) {
        index += 1;
        continue;
      }

      if (/^-{3,}$/.test(line)) {
        blocks.push({ type: "divider" });
        index += 1;
        continue;
      }

      const markdownHeadingMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (markdownHeadingMatch) {
        blocks.push({
          type: "heading",
          content: cleanInlineText(markdownHeadingMatch[1]),
        });
        index += 1;
        continue;
      }

      const strongHeadingMatch = line.match(/^\*\*(.+?)\*\*:?$/);
      if (strongHeadingMatch) {
        blocks.push({
          type: "heading",
          content: cleanInlineText(strongHeadingMatch[1]),
        });
        index += 1;
        continue;
      }

      const isTableHeader =
        line.includes("|") &&
        index + 1 < lines.length &&
        isTableSeparator(lines[index + 1]);

      if (isTableHeader) {
        const headers = parseTableRow(line);
        index += 2;

        const rows = [];
        while (index < lines.length) {
          const rowLine = (lines[index] || "").trim();
          if (!rowLine || !rowLine.includes("|")) break;
          rows.push(parseTableRow(rowLine));
          index += 1;
        }

        blocks.push({ type: "table", headers, rows });
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        const items = [];
        while (index < lines.length) {
          const itemLine = (lines[index] || "").trim();
          if (!/^[-*]\s+/.test(itemLine)) break;
          items.push(cleanInlineText(itemLine.replace(/^[-*]\s+/, "")));
          index += 1;
        }
        blocks.push({ type: "list", items });
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        const items = [];
        while (index < lines.length) {
          const itemLine = (lines[index] || "").trim();
          if (!/^\d+\.\s+/.test(itemLine)) break;
          items.push(cleanInlineText(itemLine.replace(/^\d+\.\s+/, "")));
          index += 1;
        }
        blocks.push({ type: "ordered", items });
        continue;
      }

      const paragraphLines = [line];
      index += 1;
      while (index < lines.length) {
        const next = (lines[index] || "").trim();
        if (!next) break;
        if (/^-{3,}$/.test(next)) break;
        if (/^#{1,6}\s+/.test(next)) break;
        if (/^\*\*(.+?)\*\*:?$/.test(next)) break;
        if (/^[-*]\s+/.test(next)) break;
        if (/^\d+\.\s+/.test(next)) break;
        if (
          next.includes("|") &&
          index + 1 < lines.length &&
          isTableSeparator(lines[index + 1] || "")
        ) {
          break;
        }
        paragraphLines.push(next);
        index += 1;
      }

      pushParagraph(paragraphLines.join(" "));
    }

    return blocks;
  };

  const renderAiBlocks = (text) => {
    const blocks = buildAiBlocks(text);

    if (!blocks.length) {
      return <p className="ai-analysis-paragraph">Sin respuesta.</p>;
    }

    return blocks.map((block, blockIndex) => {
      const key = `${block.type}-${blockIndex}`;

      if (block.type === "heading") {
        return (
          <h4 key={key} className="ai-analysis-heading">
            {block.content}
          </h4>
        );
      }

      if (block.type === "divider") {
        return <hr key={key} className="ai-analysis-divider" />;
      }

      if (block.type === "list") {
        return (
          <ul key={key} className="ai-analysis-list">
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        );
      }

      if (block.type === "ordered") {
        return (
          <ol key={key} className="ai-analysis-list ai-analysis-list-ordered">
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>{item}</li>
            ))}
          </ol>
        );
      }

      if (block.type === "table") {
        return (
          <div key={key} className="table-responsive ai-analysis-table-wrap">
            <table className="ai-analysis-table">
              <thead>
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th key={`${key}-header-${headerIndex}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${key}-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${key}-row-${rowIndex}-cell-${cellIndex}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <p key={key} className="ai-analysis-paragraph">
          {block.content}
        </p>
      );
    });
  };

  const requestAnalysisFromGroq = async (mode) => {
    const safeCheck = getSafeTurnosForAnalysis();

    if (!safeCheck.ok) {
      setAiAnalysis(safeCheck.reason);
      return;
    }

    setAiLoading(true);
    setAiAnalysis("");

    try {
      const historialAnonimizado = buildAnonimizedHistory(safeCheck.turnos);

      const prompt = {
        pacienteAnonimo: {
          idInterno: activeSelectedPaciente._id,
          especialidades: [
            ...new Set(
              safeCheck.turnos
                .map((turno) => turno?.especialidad?.nombre)
                .filter(Boolean),
            ),
          ],
        },
        historial: historialAnonimizado,
        regla:
          mode === "historial"
            ? "Analizar evolución clínica, responder si viene mejorando o no, y describir la tendencia general sin diagnosticar de forma definitiva."
            : "Sugerir un plan de tratamiento o seguimiento futuro basado en la evolución registrada, sin inventar datos ni diagnóstico definitivo.",
      };

      const messages = [
        {
          role: "user",
          content: `Actuá como asistente clínico de fisioterapia. ${
            mode === "historial"
              ? "Analizá la evolución del paciente a partir de este historial anónimo y respondé en español de forma clara y útil, con texto natural y estructura breve."
              : "A partir del mismo historial anónimo, sugerí un plan de tratamiento y seguimiento futuro para este paciente, en español, con texto natural y estructura breve."
          } No incluyas nombre, DNI, email, teléfono, dirección ni ninguna información identificable. Usá texto con resumen, objetivos, plan y recomendaciones. Sigue esta entrada: ${JSON.stringify(prompt)}`,
        },
      ];

      const { data: response } = await api.post("/groq", { messages });
      const respuestaTexto =
        response?.choices?.[0]?.message?.content ||
        response?.mensaje ||
        response?.content ||
        "Sin respuesta.";

      setAiAnalysis(formatAiText(respuestaTexto));
    } catch (error) {
      console.error("No se pudo generar el análisis del paciente:", error);
      setAiAnalysis(
        "No se pudo completar la evaluación con la información disponible. Intentalo nuevamente.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzePacienteHistory = async () => {
    await requestAnalysisFromGroq("historial");
  };

  const handleSuggestFutureTreatment = async () => {
    await requestAnalysisFromGroq("tratamiento");
  };

  const resetViewer = () => {
    setFullscreenImage(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleZoomChange = (nextZoom) => {
    setZoom(Math.min(3, Math.max(1, Number(nextZoom.toFixed(2)))));
  };

  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !selectedPaciente?._id) {
      if (event.target) event.target.value = "";
      return;
    }

    try {
      setUploadingImages(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("imagen", file));
      formData.append("folder", "pacientes");

      const { data } = await api.patch(
        `/pacientes/${selectedPaciente._id}/imagenes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data?.paciente) {
        const updatedPaciente = data.paciente;
        setInternalSelectedPaciente(updatedPaciente);
        onPacienteUpdated?.(updatedPaciente);
      }
    } catch (error) {
      console.error("No se pudieron subir las imágenes:", error);
    } finally {
      setUploadingImages(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleWheelZoom = (event) => {
    if (!fullscreenImage) return;
    event.preventDefault();
    const nextZoom = event.deltaY < 0 ? zoom + 0.15 : zoom - 0.15;
    handleZoomChange(nextZoom);
  };

  const handlePointerDown = (event) => {
    if (!fullscreenImage) return;
    event.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget?.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!fullscreenImage || !isDragging || !dragStartRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const movementMultiplier = 0.9 + zoom * 0.5;

    setPan({
      x: dragStartRef.current.panX + dx * movementMultiplier,
      y: dragStartRef.current.panY + dy * movementMultiplier,
    });
  };

  const handlePointerUp = (event) => {
    setIsDragging(false);
    dragStartRef.current = null;

    if (event?.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    if (!fullscreenImage) return;

    const handleKeyDown = (event) => {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
      ) {
        event.preventDefault();
        const step = 24;

        setPan((currentPan) => {
          switch (event.key) {
            case "ArrowLeft":
              return { ...currentPan, x: currentPan.x + step };
            case "ArrowRight":
              return { ...currentPan, x: currentPan.x - step };
            case "ArrowUp":
              return { ...currentPan, y: currentPan.y + step };
            case "ArrowDown":
              return { ...currentPan, y: currentPan.y - step };
            default:
              return currentPan;
          }
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenImage]);

  const closeModal = () => {
    resetViewer();
    setAiAnalysis("");
    setAiLoading(false);
    setInternalSelectedPaciente(null);
    onClosePaciente?.();
  };

  return (
    <>
      {fullscreenImage && (
        <div
          className="turno-image-fullscreen-backdrop"
          onClick={resetViewer}
          onPointerUp={handlePointerUp}
        >
          <div
            className="turno-image-fullscreen-shell"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="turno-image-toolbar">
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => handleZoomChange(zoom - 0.15)}
              >
                -
              </button>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => handleZoomChange(zoom + 0.15)}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                Reset
              </button>
              <span className="turno-image-hint">Arrastra o usa flechas</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-light turno-image-close"
                onClick={resetViewer}
              >
                Cerrar
              </button>
            </div>

            <img
              src={fullscreenImage}
              alt="Vista ampliada del paciente"
              className="turno-image-fullscreen"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
              onWheel={handleWheelZoom}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
        </div>
      )}

      {activeSelectedPaciente && (
        <div className="turno-detail-backdrop" onClick={closeModal}>
          <div
            className="card turno-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="turno-detail-header">
              <div>
                <p className="turno-detail-label">Paciente</p>
                <h3>{getPacienteName(activeSelectedPaciente)}</h3>
              </div>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <button
                  className="btn btn-sm btn-outline-primary"
                  type="button"
                  onClick={handleAnalyzePacienteHistory}
                  disabled={aiLoading}
                  style={{
                    borderRadius: "999px",
                    padding: "0.5rem 1rem",
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                  }}
                >
                  {aiLoading ? "Analizando..." : "Ver evolución"}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  type="button"
                  onClick={handleSuggestFutureTreatment}
                  disabled={aiLoading}
                  style={{
                    borderRadius: "999px",
                    padding: "0.5rem 1rem",
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                  }}
                >
                  Sugerir tratamiento
                </button>
                <button
                  className="btn btn-sm btn-light"
                  type="button"
                  onClick={closeModal}
                  style={{
                    borderRadius: "999px",
                    padding: "0.5rem 1rem",
                    fontWeight: 500,
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="turno-detail-grid">
              <div className="turno-detail-box">
                <span>Nombre completo</span>
                <strong>{getPacienteName(activeSelectedPaciente)}</strong>
              </div>

              <div className="turno-detail-box">
                <span>Cedula</span>
                <strong>{activeSelectedPaciente.cedula || "Sin cedula"}</strong>
              </div>

              <div className="turno-detail-box">
                <span>Email</span>
                <strong>{activeSelectedPaciente.email || "Sin email"}</strong>
              </div>

              <div className="turno-detail-box">
                <span>Telefono</span>
                <strong>
                  {activeSelectedPaciente.telefono || "Sin telefono"}
                </strong>
              </div>

              <div className="turno-detail-box turno-detail-box-full">
                <div className="patient-images-toolbar">
                  <span>Imágenes</span>
                  <button
                    type="button"
                    className="file-upload-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    style={{
                      pointerEvents: uploadingImages ? "none" : "auto",
                    }}
                  >
                    {uploadingImages ? "Subiendo..." : "+"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleAddImages}
                  />
                </div>

                {activeSelectedPaciente.imagenes &&
                activeSelectedPaciente.imagenes.length > 0 ? (
                  <div className="paciente-image-gallery">
                    {activeSelectedPaciente.imagenes.map((imagen, index) => (
                      <button
                        key={`${imagen}-${index}`}
                        type="button"
                        className="paciente-image-thumb"
                        onClick={() => {
                          setFullscreenImage(imagen);
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        }}
                      >
                        <img
                          src={imagen}
                          alt={`Imagen del paciente ${index + 1}`}
                          className="paciente-detail-image"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>Sin imágenes cargadas</p>
                )}
              </div>

              <div className="turno-detail-box turno-detail-box-full">
                <span>Historial de turnos</span>
                {historyLoading ? (
                  <p>Cargando historial...</p>
                ) : pacienteHistory.length > 0 ? (
                  <ul className="turno-patient-history">
                    {pacienteHistory.map((turno) => (
                      <li key={turno._id} className="turno-history-item">
                        <div className="turno-history-main">
                          <span className="turno-history-date">
                            {turno.fecha} · {turno.hora}
                          </span>
                          <small className="turno-history-specialty">
                            {turno.especialidad?.nombre || "Especialidad"}
                          </small>
                        </div>
                        <span
                          className={`turno-history-status turno-history-status-${
                            turno.estado || "pendiente"
                          }`}
                        >
                          {turno.estado || "pendiente"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Sin turnos registrados</p>
                )}
              </div>

              <div
                className="turno-detail-box turno-detail-box-full"
                style={{
                  background:
                    "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      Asistente clínico
                    </span>
                    <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                      Resumen clínico con IA
                    </strong>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.35rem 0.7rem",
                      borderRadius: "999px",
                      background: "rgba(35, 104, 255, 0.09)",
                      color: "#2158d2",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    Privado
                  </span>
                </div>

                {aiLoading ? (
                  <p style={{ margin: 0, color: "#475569" }}>
                    Cargando análisis...
                  </p>
                ) : aiAnalysis ? (
                  <div
                    className="p-3 border rounded ai-analysis-shell"
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      borderColor: "rgba(148, 163, 184, 0.32)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                    }}
                  >
                    <div className="ai-analysis-content">
                      {renderAiBlocks(aiAnalysis)}
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
                    El análisis usa solo historial clínico anónimo y no expone
                    datos personales. Si no hay información suficiente, no se
                    inventa una evolución ni un tratamiento.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="card table-card border-0">
        <div className="section-head mb-3">
          <h2 className="mb-1">Listado de pacientes</h2>
          <p className="mb-0 text-secondary">
            Gestion de datos personales y contacto
          </p>
        </div>

        {loading && <p>Cargando pacientes...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p>No hay pacientes para mostrar.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="table-responsive modern-table-wrap">
            <table className="table table-striped align-middle mb-0 modern-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cedula</th>
                  <th>Email</th>
                  <th>Telefono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((paciente) => (
                  <tr
                    key={paciente._id}
                    onClick={() => {
                      setInternalSelectedPaciente(paciente);
                      onSelectPaciente?.(paciente);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      {paciente.nombre} {paciente.apellido}
                    </td>
                    <td>{paciente.cedula || "-"}</td>
                    <td>{paciente.email || "-"}</td>
                    <td>{paciente.telefono || "-"}</td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(paciente);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(paciente._id);
                        }}
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
    </>
  );
};

export default PacientesList;
