import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { pacienteSchema } from "../../validators/pacientes.validators";

const emptyPacienteForm = {
  nombre: "",
  apellido: "",
  cedula: "",
  telefono: "",
  email: "",
};

const PacienteForm = ({
  onSubmit,
  loading,
  editingId,
  initialValues = emptyPacienteForm,
  onCancel,
  error,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: editingId ? undefined : joiResolver(pacienteSchema),
    mode: "onSubmit",
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitForm = async (values) => {
    const payload = {
      ...values,
      email: values.email || "",
    };

    const result = await onSubmit(payload, selectedFile);
    if (result) {
      setSelectedFile(null);
      reset(emptyPacienteForm);
    }
  };

  return (
    <form
      className="card form-card section-card border-0"
      onSubmit={handleSubmit(submitForm)}
    >
      <h2>{editingId ? "Editar paciente" : "Nuevo paciente"}</h2>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="paciente-nombre">Nombre</label>
          <input
            id="paciente-nombre"
            className="form-control"
            type="text"
            {...register("nombre")}
          />
          {errors.nombre && <small>{errors.nombre.message}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="paciente-apellido">Apellido</label>
          <input
            id="paciente-apellido"
            className="form-control"
            type="text"
            {...register("apellido")}
          />
          {errors.apellido && <small>{errors.apellido.message}</small>}
        </div>

        <div className="form-field form-field-half">
          <label htmlFor="paciente-cedula">Cedula</label>
          <input
            id="paciente-cedula"
            className="form-control"
            type="text"
            {...register("cedula")}
          />
          {errors.cedula && <small>{errors.cedula.message}</small>}
        </div>

        <div className="form-field form-field-half">
          <label htmlFor="paciente-telefono">Telefono</label>
          <input
            id="paciente-telefono"
            className="form-control"
            type="text"
            {...register("telefono")}
          />
          {errors.telefono && <small>{errors.telefono.message}</small>}
        </div>

        <div className="form-field form-field-half">
          <label htmlFor="paciente-email">Email</label>
          <input
            id="paciente-email"
            className="form-control"
            type="email"
            {...register("email")}
          />
          {errors.email && <small>{errors.email.message}</small>}
        </div>

        <div className="form-field file-upload-field">
          <label htmlFor="paciente-image-upload">Imagen del paciente</label>
          <div className="file-upload-inline">
            <div className="file-upload-modern">
              <input
                ref={fileInputRef}
                id="paciente-image-upload"
                className="file-upload-input"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] || null);
                }}
              />
              <button
                type="button"
                className="file-upload-button"
                aria-label="Seleccionar imagen"
                onClick={() => fileInputRef.current?.click()}
              >
                +
              </button>
            </div>
            <small className="file-upload-name">
              {selectedFile ? selectedFile.name : "Sin imagen cargada"}
            </small>
          </div>
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
              ? "Actualizar paciente"
              : "Crear paciente"}
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

export default PacienteForm;
