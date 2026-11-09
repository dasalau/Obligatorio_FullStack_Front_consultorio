import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/auth.slice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { to: "/dashboard", label: "Inicio" },
    { to: "/turnos", label: "Turnos" },
    { to: "/pacientes", label: "Pacientes" },
    { to: "/especialidades", label: "Especialidades" },
    { to: "/reportes", label: "Reportes" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-navbar card border-0">
      <div className="w-100 d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src="/logo_cecilia_travieso_rpg.svg"
              alt="Logo Clinica de Fisioterapia CT"
              className="brand-mark brand-logo"
            />
            <div>
              <h5 className="mb-0">Clinica de Fisioterapia CT</h5>
              <p className="mb-0 text-light-emphasis">
                Usuario activo:{" "}
                <strong>
                  {user?.nombre && user?.apellido
                    ? `${user.nombre} ${user.apellido}`
                    : user?.username || "-"}
                </strong>
              </p>
            </div>
          </div>
          <button className="btn btn-sm btn-light" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>

        <div className="nav-pills-wrap">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-pill ${isActive ? "nav-pill-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
