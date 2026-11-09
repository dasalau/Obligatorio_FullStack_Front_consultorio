import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const ContainerPage = () => {
  return (
    <main className="page">
      <Navbar />
      <Outlet />
    </main>
  );
};

export default ContainerPage;
