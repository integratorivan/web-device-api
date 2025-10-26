import "./App.css";
import { MotionDemo } from "./components/MotionDemo";
import { OrientationDemo } from "./components/OrientationDemo";
import { TouchDemo } from "./components/TouchDemo";

function App() {
  return (
    <div class="app-shell">
      <header class="hero">
        <p class="hero__eyebrow">Web diagnostic kit</p>
        <h1>Realtime sensor playground</h1>
        <p class="hero__lead">
          Stream motion, orientation, and touch data straight from the browser.
          Move or pinch your device to watch the values update.
        </p>
      </header>

      <section class="sensor-layout">
        <MotionDemo />
        <OrientationDemo />
        <TouchDemo />
      </section>
    </div>
  );
}

export default App;
