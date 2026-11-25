import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

const ContainerPage = () => {
  return (
    <main className="page container-fluid px-2 px-sm-3 px-lg-4 py-3 py-md-4">
      <div className="mx-auto app-shell">
        <Navbar />
        <Outlet />
      </div>
    </main>
  );
};

export default ContainerPage;
