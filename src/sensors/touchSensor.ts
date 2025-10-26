export interface TouchPoint {
  identifier: number;
  x: number;
  y: number;
  force: number;
  radiusX: number;
  radiusY: number;
  pageX: number;
  pageY: number;
}

export interface TouchData {
  touchCount: number;
  touches: TouchPoint[];
  averageForce: number;
  maxForce: number;
  totalArea: number;
  multiTouchDetected: boolean;
  gestureType: "single" | "pinch" | "spread" | "none";
  timestamp: number;
  isValid: boolean;
}

export class TouchSensor {
  private data: TouchData = {
    touchCount: 0,
    touches: [],
    averageForce: 0,
    maxForce: 0,
    totalArea: 0,
    multiTouchDetected: false,
    gestureType: "none",
    timestamp: 0,
    isValid: false,
  };

  private listeners: ((data: TouchData) => void)[] = [];
  private previousTouchCount = 0;
  private pinchStartDistance = 0;

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    document.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchend", this.handleTouchEnd);
    document.addEventListener("touchcancel", this.handleTouchEnd);
  }

  private handleTouchStart = (event: TouchEvent) => {
    this.processTouchEvent(event);
    this.previousTouchCount = event.touches.length;

    if (event.touches.length === 2) {
      this.pinchStartDistance = this.calculateDistance(
        event.touches[0],
        event.touches[1],
      );
    }
  };

  private handleTouchMove = (event: TouchEvent) => {
    this.processTouchEvent(event);

    if (event.touches.length === 2 && this.previousTouchCount === 2) {
      const currentDistance = this.calculateDistance(
        event.touches[0],
        event.touches[1],
      );
      const distanceChange = currentDistance - this.pinchStartDistance;

      if (Math.abs(distanceChange) > 10) {
        this.data.gestureType = distanceChange > 0 ? "spread" : "pinch";
      }
    }
  };

  private handleTouchEnd = (event: TouchEvent) => {
    this.processTouchEvent(event);
    this.data.gestureType = event.touches.length > 0 ? "single" : "none";
    this.previousTouchCount = event.touches.length;
    this.pinchStartDistance = 0;
  };

  private processTouchEvent(event: TouchEvent) {
    const touches = Array.from(event.touches).map((touch, index) => ({
      identifier: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      force: touch.force || 0.5,
      radiusX: touch.radiusX || 0,
      radiusY: touch.radiusY || 0,
      pageX: touch.pageX,
      pageY: touch.pageY,
    }));

    const forces = touches.map((t) => t.force);
    const areas = touches.map((t) => Math.PI * t.radiusX * t.radiusY);

    this.data = {
      touchCount: event.touches.length,
      touches: touches,
      averageForce:
        touches.length > 0
          ? parseFloat(
              (forces.reduce((a, b) => a + b, 0) / touches.length).toFixed(2),
            )
          : 0,
      maxForce: touches.length > 0 ? Math.max(...forces) : 0,
      totalArea: areas.reduce((a, b) => a + b, 0),
      multiTouchDetected: touches.length > 1,
      gestureType: touches.length === 1 ? "single" : this.data.gestureType,
      timestamp: event.timeStamp || Date.now(),
      isValid: true,
    };

    this.notifyListeners();
  }

  private calculateDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.data));
  }

  public subscribe(callback: (data: TouchData) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getData(): TouchData {
    return { ...this.data };
  }

  public isSupported(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  public test(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      const handleTest = () => {
        clearTimeout(timeout);
        document.removeEventListener("touchstart", handleTest);
        resolve(true);
      };

      document.addEventListener("touchstart", handleTest, { once: true });
    });
  }

  public getSupportInfo() {
    return {
      touchSupported: this.isSupported(),
      maxTouchPoints: navigator.maxTouchPoints || 0,
      forceSupported: "ontouchstart" in window && "force" in Touch.prototype,
      radiusSupported: "ontouchstart" in window && "radiusX" in Touch.prototype,
    };
  }

  public destroy() {
    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchcancel", this.handleTouchEnd);
    this.listeners = [];
  }
}

export const touchSensor = new TouchSensor();
