import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { especialidadSchema } from "../../validators/especialidades.validators";

const emptyEspecialidadForm = {
  nombre: "",
  descripcion: "",
};

const EspecialidadForm = ({
  onSubmit,
  loading,
  editingId,
  initialValues = emptyEspecialidadForm,
  onCancel,
  error,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: editingId ? undefined : joiResolver(especialidadSchema),
    mode: "onSubmit",
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitForm = async (values) => {
    const result = await onSubmit(values);
    if (result) {
      reset(emptyEspecialidadForm);
    }
  };

  return (
    <form
      className="card form-card section-card border-0"
      onSubmit={handleSubmit(submitForm)}
    >
      <h2>{editingId ? "Editar especialidad" : "Nueva especialidad"}</h2>

      <div className="form-grid">
        <div className="form-field form-field-full">
          <label htmlFor="especialidad-nombre">Nombre</label>
          <input
            id="especialidad-nombre"
            className="form-control"
            type="text"
            {...register("nombre")}
          />
          {errors.nombre && <small>{errors.nombre.message}</small>}
        </div>

        <div className="form-field form-field-full">
          <label htmlFor="especialidad-descripcion">Descripcion</label>
          <textarea
            id="especialidad-descripcion"
            className="form-control"
            rows={3}
            {...register("descripcion")}
          />
          {errors.descripcion && <small>{errors.descripcion.message}</small>}
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
              ? "Actualizar especialidad"
              : "Crear especialidad"}
        </button>
        {onCancel && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={onCancel}
          >
            {editingId ? "Cancelar edicion" : "Cancelar"}
          </button>
        )}
      </div>
    </form>
  );
};

export default EspecialidadForm;
