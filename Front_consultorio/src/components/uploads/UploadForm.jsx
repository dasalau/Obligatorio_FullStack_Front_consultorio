import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import api from "../../api/api";
import { setImagen } from "../../features/uploads/uploads.slice";

const UploadForm = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const subirImagen = async (data) => {
    const archivo = data.imagen?.[0];

    if (!archivo) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("imagen", archivo);
      formData.append("folder", "consultorio");

      const { data: response } = await api.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(setImagen({ url: response?.url || "" }));
      reset();
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  return (
    <div className="card section-card border-0">
      <div className="section-head">
        <h2 className="mb-1">Subir imagen</h2>
      </div>

      <form onSubmit={handleSubmit(subirImagen)}>
        <div className="form-field">
          <label htmlFor="upload-image">Seleccionar imagen</label>
          <input
            id="upload-image"
            type="file"
            className="form-control"
            accept="image/*"
            {...register("imagen", {
              required: "Debes seleccionar una imagen",
            })}
          />
          {errors.imagen && <small>{errors.imagen.message}</small>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Subiendo..." : "Subir imagen"}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
