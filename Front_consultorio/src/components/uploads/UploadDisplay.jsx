import { useSelector } from "react-redux";

const UploadDisplay = () => {
  const url = useSelector((state) => state.uploads.url);

  return (
    <div className="card section-card border-0">
      <div className="section-head">
        <h2 className="mb-1">Vista previa</h2>
      </div>

      {url ? (
        <img
          src={url}
          alt="Imagen subida"
          className="upload-preview-image"
        />
      ) : (
        <p className="mb-0 text-secondary">La imagen subida aparecerá aquí.</p>
      )}
    </div>
  );
};

export default UploadDisplay;
