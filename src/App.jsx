// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ActivityPage } from "./components/ActivityPage.jsx";
import { activities } from "./utils/activities.js";

export default function App() {
  const firstId = activities[0].id; // ej. "html-01"

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige "/" a la primera actividad */}
        <Route path="/" element={<Navigate to={`/${firstId}`} replace />} />

        {/* Cada actividad por su id: /html-01, /html-02, /css-01, etc. */}
        <Route path="/:activityId" element={<ActivityPage />} />
      </Routes>
    </BrowserRouter>
  );
}
