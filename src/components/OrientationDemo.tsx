import { createSignal, onCleanup, onMount, Show } from "solid-js";
import {
  orientationSensor,
  type OrientationData,
} from "../sensors/orientationSensor";
import { SensorCard } from "./SensorCard";

export function OrientationDemo() {
  const [data, setData] = createSignal<OrientationData | null>(null);
  const [supported, setSupported] = createSignal(false);
  const [testing, setTesting] = createSignal(false);
  const [testResult, setTestResult] = createSignal<"pass" | "fail" | null>(
    null,
  );

  onMount(() => {
    const hasSupport = orientationSensor.isSupported();
    setSupported(hasSupport);

    if (!hasSupport) {
      return;
    }

    setData(orientationSensor.getData());
    const unsubscribe = orientationSensor.subscribe((payload) =>
      setData({ ...payload }),
    );
    onCleanup(unsubscribe);
  });

  const runTest = async () => {
    if (testing() || !supported()) return;
    setTesting(true);
    setTestResult(null);
    const success = await orientationSensor.test();
    setTestResult(success ? "pass" : "fail");
    setTesting(false);
  };

  return (
    <SensorCard
      title="Orientation sensor"
      description="Euler angles describing device orientation relative to the world frame."
      supported={supported()}
      onTest={runTest}
      testing={testing()}
      testResult={testResult()}
    >
      <Show
        when={data()?.isValid}
        fallback={<p>Rotate or tilt the device to stream orientation data.</p>}
      >
        <div class="sensor-grid">
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Alpha (z)</p>
            <span class="sensor-grid__number">{data()?.alpha.toFixed(2)}°</span>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Beta (x)</p>
            <span class="sensor-grid__number">{data()?.beta.toFixed(2)}°</span>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Gamma (y)</p>
            <span class="sensor-grid__number">{data()?.gamma.toFixed(2)}°</span>
          </div>
        </div>
      </Show>
    </SensorCard>
  );
}
