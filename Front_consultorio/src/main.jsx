import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { store } from "./store/store";
import { logout } from "./features/auth/auth.slice";

window.addEventListener("auth:logout", () => {
  store.dispatch(logout());
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
