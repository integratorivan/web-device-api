import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { touchSensor } from "../sensors/touchSensor";
import { orientationSensor } from "../sensors/orientationSensor";
import { motionSensor } from "../sensors/motionSensor";
import "./DataDisplayModal.css";

interface DataDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: number;
  question?: string;
}

// Simplified data structure for now
interface SensorData {
  touches: any[];
  orientation: any;
  motion: any;
  timestamp: number;
}

interface DataDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: number;
  question?: string;
}

export function DataDisplayModal(props: DataDisplayModalProps) {
  const [data, setData] = createSignal<SensorDataCollection | null>(null);
  const [isCollecting, setIsCollecting] = createSignal(false);
  const [stats, setStats] = createSignal<any>(null);

  onMount(() => {
    // Подписка на обновления данных от коллектора
    const unsubscribe = sensorCollector.subscribe((collectorData) => {
      setData(collectorData);
      setIsCollecting(collectorData.isActive);
      setStats(sensorCollector.getStats());
    });

    // Подписка на обновления сенсоров
    const unsubscribeTouch = touchSensor.subscribe((touchData) => {
      if (touchData.touches.length > 0) {
        sensorCollector.updateTouch(touchData.touches as TouchList);
      }
    });

    const unsubscribeOrientation = orientationSensor.subscribe(
      (orientationData) => {
        if (orientationData.isValid) {
          sensorCollector.updateOrientation(
            orientationData.alpha,
            orientationData.beta,
            orientationData.gamma,
          );
        }
      },
    );

    const unsubscribeMotion = motionSensor.subscribe((motionData) => {
      if (motionData.isValid) {
        sensorCollector.updateMotion(
          motionData.acceleration,
          motionData.accelerationIncludingGravity,
          motionData.rotationRate,
        );
      }
    });

    onCleanup(() => {
      unsubscribe();
      unsubscribeTouch();
      unsubscribeOrientation();
      unsubscribeMotion();
    });
  });

  const startCollection = () => {
    sensorCollector.startCollection(
      props.questionId || 1,
      props.question || "Test question",
    );
  };

  const stopCollection = () => {
    sensorCollector.stopCollection();
  };

  const resetData = () => {
    sensorCollector.reset();
  };

  const exportData = () => {
    const jsonData = sensorCollector.exportData();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-data-Q${props.questionId || 1}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closeModal = () => {
    if (isCollecting()) {
      stopCollection();
    }
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal-overlay" onClick={closeModal}>
        <div class="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div class="modal-header">
            <div>
              <h2>Sensor Data Collector</h2>
              <div class="header-info">
                <span
                  class={`status-indicator ${isCollecting() ? "active" : "inactive"}`}
                >
                  {isCollecting() ? "● Recording" : "○ Stopped"}
                </span>
                <span class="question-info">
                  Q{props.questionId || 1}: {props.question || "Test question"}
                </span>
              </div>
            </div>
            <button class="close-btn" onClick={closeModal}>
              ×
            </button>
          </div>

          {/* Controls */}
          <div class="modal-controls">
            <Show when={!isCollecting()}>
              <button class="control-btn start-btn" onClick={startCollection}>
                ▶ Start Collection
              </button>
            </Show>
            <Show when={isCollecting()}>
              <button class="control-btn stop-btn" onClick={stopCollection}>
                ■ Stop Collection
              </button>
            </Show>
            <button
              class="control-btn reset-btn"
              onClick={resetData}
              disabled={isCollecting()}
            >
              ⟲ Reset
            </button>
            <button
              class="control-btn export-btn"
              onClick={exportData}
              disabled={!data() || data().Time.length === 0}
            >
              ↓ Export JSON
            </button>
          </div>

          {/* Statistics */}
          <Show when={stats()}>
            <div class="stats-section">
              <h3>Collection Statistics</h3>
              <div class="stats-grid">
                <div>
                  <strong>Data Points:</strong> {stats().dataPoints}
                </div>
                <div>
                  <strong>Duration:</strong>{" "}
                  {(stats().duration / 1000).toFixed(1)}s
                </div>
                <div>
                  <strong>Frequency:</strong> {stats().frequency} Hz
                </div>
                <div>
                  <strong>Accuracy:</strong>{" "}
                  {(stats().accuracy * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </Show>

          {/* Data Display */}
          <Show when={data()}>
            <div class="data-section">
              <h3>Real-time Sensor Data</h3>
              <pre class="data-display">
                {`{
    "QuestionId": ${data().QuestionId},
    "Answer": "${data().Answer}",
    "Accuracy": ${data().Accuracy.toFixed(3)},
    "isActive": ${data().isActive},
    "Time": [${data().Time.slice(-5).join(", ")}],
    "Orientation": [${data()
      .Orientation.slice(-5)
      .map((v) => v.toString())
      .join(", ")}],
    "Gravity": [${data()
      .Gravity.slice(-5)
      .map((v) => v.toString())
      .join(", ")}],
    "Accelerometer": [${data()
      .Accelerometer.slice(-5)
      .map((v) => v.toString())
      .join(", ")}],
    "Gyroscope": [${data()
      .Gyroscope.slice(-5)
      .map((v) => v.toString())
      .join(", ")}],
    "TouchForce": [${data()
      .TouchForce.slice(-5)
      .map((f) => f.toFixed(3))
      .join(", ")}],
    "TouchRadius": [${data()
      .TouchRadius.slice(-5)
      .map((r) => (r || 0).toFixed(1))
      .join(", ")}]
}`}
              </pre>
            </div>
          </Show>

          {/* Sensor Status */}
          <div class="sensor-status">
            <h3>Sensor Status</h3>
            <div class="sensor-grid">
              <div
                class={`sensor-item ${data() && data().Orientation.length > 0 ? "active" : "inactive"}`}
              >
                <span class="sensor-name">Orientation</span>
                <span class="sensor-count">
                  {data()?.Orientation.length || 0} pts
                </span>
              </div>
              <div
                class={`sensor-item ${data() && data().Gravity.length > 0 ? "active" : "inactive"}`}
              >
                <span class="sensor-name">Gravity</span>
                <span class="sensor-count">
                  {data()?.Gravity.length || 0} pts
                </span>
              </div>
              <div
                class={`sensor-item ${data() && data().Accelerometer.length > 0 ? "active" : "inactive"}`}
              >
                <span class="sensor-name">Accelerometer</span>
                <span class="sensor-count">
                  {data()?.Accelerometer.length || 0} pts
                </span>
              </div>
              <div
                class={`sensor-item ${data() && data().Gyroscope.length > 0 ? "active" : "inactive"}`}
              >
                <span class="sensor-name">Gyroscope</span>
                <span class="sensor-count">
                  {data()?.Gyroscope.length || 0} pts
                </span>
              </div>
              <div
                class={`sensor-item ${data() && data().TouchForce.length > 0 ? "active" : "inactive"}`}
              >
                <span class="sensor-name">Touch Force</span>
                <span class="sensor-count">
                  {data()?.TouchForce.length || 0} pts
                </span>
              </div>
              <div
                class={`sensor-item ${data() && data().TouchRadius.length > 0 ? "active" : "inactive"}`}
              >
                <span class="sensor-name">Touch Radius</span>
                <span class="sensor-count">
                  {data()?.TouchRadius.length || 0} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
