// ActivityPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { activities } from "../utils/activities.js";
import { ActivityEngine } from "./ActivityEngine.jsx";
import { usePhiModel } from "../hooks/usePhiModel.js";

export function ActivityPage() {
  const { activityId } = useParams();
  const { engine } = usePhiModel();

  const activity = activities.find((a) => a.id === activityId);

  if (!activity) {
    return <div>Actividad no encontrada: {activityId}</div>;
  }

  // Si la actividad NO usa IA, podemos pasar engine aunque no se use
  return <ActivityEngine activity={activity} engine={engine} />;
}
