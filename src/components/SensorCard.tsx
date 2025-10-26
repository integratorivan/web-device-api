import type { JSX } from "solid-js";
import { Show } from "solid-js";

interface SensorCardProps {
  title: string;
  description?: string;
  supported: boolean;
  statusText?: string;
  onTest?: () => void;
  testing?: boolean;
  testResult?: "pass" | "fail" | null;
  children: JSX.Element;
  footer?: JSX.Element;
}

export function SensorCard(props: SensorCardProps) {
  return (
    <article class="sensor-card">
      <header class="sensor-card__header">
        <div>
          <h2>{props.title}</h2>
          <Show when={props.description}>
            <p class="sensor-card__description">{props.description}</p>
          </Show>
        </div>
        <div class="sensor-card__actions">
          <span
            class={`sensor-card__badge ${
              props.supported ? "sensor-card__badge--ok" : "sensor-card__badge--warn"
            }`}
          >
            {props.supported ? "Supported" : "Unavailable"}
          </span>
          <Show when={props.onTest}>
            <button class="sensor-card__test-btn" onClick={props.onTest} disabled={props.testing}>
              {props.testing ? "Testing…" : "Run test"}
            </button>
          </Show>
          <Show when={props.testResult === "pass"}>
            <span class="sensor-card__status sensor-card__status--pass">Pass</span>
          </Show>
          <Show when={props.testResult === "fail"}>
            <span class="sensor-card__status sensor-card__status--fail">No signal</span>
          </Show>
        </div>
      </header>

      <section class="sensor-card__body">
        <Show
          when={props.supported}
          fallback={<p class="sensor-card__fallback">The browser did not expose this sensor.</p>}
        >
          {props.children}
        </Show>
      </section>

      <Show when={props.footer}>
        <footer class="sensor-card__footer">{props.footer}</footer>
      </Show>
    </article>
  );
}
