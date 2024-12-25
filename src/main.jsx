import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import DetayTablo from "./DetayTablo";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DetayTablo />
    <ToastContainer
      position="bottom-center"
      autoClose={3000}
      hideProgressBar={false}
      closeOnClick={true}
      rtl={false}
      draggable
      pauseOnFocusLoss
      pauseOnHover
      theme="colored"
    />
  </StrictMode>,
);
