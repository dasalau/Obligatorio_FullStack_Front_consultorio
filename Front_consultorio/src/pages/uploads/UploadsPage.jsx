import { useEffect } from "react";
import { useDispatch } from "react-redux";
import UploadForm from "../../components/uploads/UploadForm";
import UploadDisplay from "../../components/uploads/UploadDisplay";
import { resetImagen } from "../../features/uploads/uploads.slice";

const UploadsPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(resetImagen());
    };
  }, [dispatch]);

  return (
    <div className="d-grid gap-3">
      <UploadForm />
      <UploadDisplay />
    </div>
  );
};

export default UploadsPage;
