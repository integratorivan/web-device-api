import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { motionSensor, type MotionData } from "../sensors/motionSensor";
import { SensorCard } from "./SensorCard";

export function MotionDemo() {
  const [data, setData] = createSignal<MotionData | null>(null);
  const [supported, setSupported] = createSignal(false);
  const [testing, setTesting] = createSignal(false);
  const [testResult, setTestResult] = createSignal<"pass" | "fail" | null>(
    null,
  );

  onMount(() => {
    const hasSupport = motionSensor.isSupported();
    setSupported(hasSupport);

    if (!hasSupport) {
      return;
    }

    setData(motionSensor.getData());
    const unsubscribe = motionSensor.subscribe((payload) =>
      setData({ ...payload }),
    );
    onCleanup(unsubscribe);
  });

  const runTest = async () => {
    if (testing() || !supported()) return;
    setTesting(true);
    setTestResult(null);
    const success = await motionSensor.test();
    setTestResult(success ? "pass" : "fail");
    setTesting(false);
  };

  const renderVector = (
    label: string,
    vector?: { x: number; y: number; z: number },
  ) => (
    <div class="sensor-grid__row">
      <p class="sensor-grid__label">{label}</p>
      <div class="sensor-grid__values">
        <span>X: {vector ? vector.x.toFixed(2) : "-"}</span>
        <span>Y: {vector ? vector.y.toFixed(2) : "-"}</span>
        <span>Z: {vector ? vector.z.toFixed(2) : "-"}</span>
      </div>
    </div>
  );

  return (
    <SensorCard
      title="Motion sensor"
      description="Device acceleration, including raw and gravity-influenced values plus rotation rate."
      supported={supported()}
      onTest={runTest}
      testing={testing()}
      testResult={testResult()}
    >
      <Show
        when={data()?.isValid}
        fallback={<p>Move the device to receive motion updates.</p>}
      >
        <div class="sensor-grid">
          {renderVector("Acceleration", data()?.acceleration)}
          {renderVector(
            "Acceleration + gravity",
            data()?.accelerationIncludingGravity,
          )}
          <Show when={data()?.rotationRate}>
            {(rotation) => (
              <div class="sensor-grid__row">
                <p class="sensor-grid__label">Rotation</p>
                <div class="sensor-grid__values">
                  <span>α: {rotation().alpha.toFixed(2)}</span>
                  <span>β: {rotation().beta.toFixed(2)}</span>
                  <span>γ: {rotation().gamma.toFixed(2)}</span>
                </div>
              </div>
            )}
          </Show>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Interval</p>
            <div class="sensor-grid__values">
              <span>{data()?.interval ?? 0} ms</span>
            </div>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Motion detected</p>
            <div class="sensor-grid__values">
              <span
                class={data()?.motionDetected ? "badge badge--ok" : "badge"}
              >
                {String(data()?.motionDetected)}
              </span>
            </div>
          </div>
        </div>
      </Show>
    </SensorCard>
  );
}
