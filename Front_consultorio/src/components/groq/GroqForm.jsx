import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import api from "../../api/api";
import { setRespuesta } from "../../features/groq/groq.slice";

const GroqForm = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const obtenerConsulta = async (data) => {
    try {
      const messages = [
        {
          role: "user",
          content: data.messages,
        },
      ];

      const { data: response } = await api.post("/groq", { messages });

      const respuestaTexto =
        response?.choices?.[0]?.message?.content ||
        response?.mensaje ||
        response?.content ||
        "Sin respuesta";

      dispatch(setRespuesta({ mensaje: respuestaTexto }));
      reset();
    } catch (error) {
      console.error("Error al consultar Groq:", error);
      dispatch(setRespuesta({ mensaje: "No se pudo obtener la respuesta." }));
    }
  };

  return (
    <div className="card section-card border-0">
      <div className="section-head">
        <h2 className="mb-1">Consulta IA</h2>
      </div>

      <form onSubmit={handleSubmit(obtenerConsulta)}>
        <div className="form-field">
          <label htmlFor="groq-message">Consulta</label>
          <textarea
            id="groq-message"
            className="form-control"
            rows="4"
            placeholder="Escribí tu consulta aquí..."
            {...register("messages", {
              required: "La consulta es obligatoria",
            })}
          />
          {errors.messages && <small>{errors.messages.message}</small>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Consultando..." : "Consultar"}
        </button>
      </form>
    </div>
  );
};

export default GroqForm;
