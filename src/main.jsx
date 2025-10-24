import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import FirebaseProvider from "./providers/FirebaseProvider.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>
);
