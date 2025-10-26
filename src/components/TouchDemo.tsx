import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { touchSensor, type TouchData } from "../sensors/touchSensor";
import { SensorCard } from "./SensorCard";

type SupportInfo = ReturnType<typeof touchSensor.getSupportInfo>;

export function TouchDemo() {
  const [data, setData] = createSignal<TouchData | null>(null);
  const [supported, setSupported] = createSignal(false);
  const [supportInfo, setSupportInfo] = createSignal<SupportInfo | null>(null);
  const [testing, setTesting] = createSignal(false);
  const [testResult, setTestResult] = createSignal<"pass" | "fail" | null>(
    null,
  );

  onMount(() => {
    const info = touchSensor.getSupportInfo();
    setSupportInfo(info);
    setSupported(info.touchSupported);

    if (!info.touchSupported) {
      return;
    }

    setData(touchSensor.getData());
    const unsubscribe = touchSensor.subscribe((payload) =>
      setData({ ...payload }),
    );
    onCleanup(unsubscribe);
  });

  const runTest = async () => {
    if (testing() || !supported()) return;
    setTesting(true);
    setTestResult(null);
    const success = await touchSensor.test();
    setTestResult(success ? "pass" : "fail");
    setTesting(false);
  };

  return (
    <SensorCard
      title="Touch sensor"
      description="Real-time multi-touch breakdown with inferred gestures."
      supported={supported()}
      onTest={runTest}
      testing={testing()}
      testResult={testResult()}
      footer={
        <Show when={supportInfo()}>
          {(info) => (
            <dl class="support-grid">
              <div>
                <dt>Max touch points</dt>
                <dd>{info().maxTouchPoints}</dd>
              </div>
              <div>
                <dt>Force data</dt>
                <dd>{info().forceSupported ? "yes" : "no"}</dd>
              </div>
              <div>
                <dt>Touch radius</dt>
                <dd>{info().radiusSupported ? "yes" : "no"}</dd>
              </div>
            </dl>
          )}
        </Show>
      }
    >
      <Show
        when={data()?.isValid}
        fallback={<p>Touch the screen to stream touch data.</p>}
      >
        <div class="sensor-grid">
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Active touches</p>
            <span class="sensor-grid__number">{data()?.touchCount ?? 0}</span>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Average force</p>
            <span class="sensor-grid__number">
              {data()?.averageForce.toFixed(2)}
            </span>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Max force</p>
            <span class="sensor-grid__number">
              {data()?.maxForce.toFixed(2)}
            </span>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Total area</p>
            <span class="sensor-grid__number">
              {data()?.totalArea.toFixed(0)} px²
            </span>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Gesture</p>
            <span class="badge">{data()?.gestureType}</span>
          </div>
          <div class="sensor-grid__row">
            <p class="sensor-grid__label">Multi-touch</p>
            <span
              class={data()?.multiTouchDetected ? "badge badge--ok" : "badge"}
            >
              {data()?.multiTouchDetected ? "yes" : "no"}
            </span>
          </div>
        </div>

        <Show when={(data()?.touches.length || 0) > 0}>
          <div class="touch-list">
            <For each={data()?.touches}>
              {(touch) => (
                <div class="touch-list__item">
                  <p class="touch-list__title">Touch #{touch.identifier}</p>
                  <div class="touch-list__grid">
                    <span>X: {Math.round(touch.x)}</span>
                    <span>Y: {Math.round(touch.y)}</span>
                    <span>Force: {touch.force.toFixed(2)}</span>
                    <span>
                      Radius: {touch.radiusX} × {touch.radiusY}
                    </span>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </SensorCard>
  );
}
