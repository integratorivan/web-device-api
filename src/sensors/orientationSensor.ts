export interface OrientationData {
  alpha: number;
  beta: number;
  gamma: number;
  isValid: boolean;
  timestamp: number;
}

export class OrientationSensor {
  private data: OrientationData = {
    alpha: 0,
    beta: 0,
    gamma: 0,
    isValid: false,
    timestamp: 0
  };

  private listeners: ((data: OrientationData) => void)[] = [];
  private isActive = false;

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener("deviceorientation", this.handleOrientation);
  }

  private handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      this.data = {
        alpha: parseFloat(event.alpha.toFixed(2)),
        beta: parseFloat(event.beta.toFixed(2)),
        gamma: parseFloat(event.gamma.toFixed(2)),
        isValid: true,
        timestamp: event.timeStamp || Date.now(),
      };

      this.notifyListeners();
    }
  };

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.data));
  }

  public subscribe(callback: (data: OrientationData) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getData(): OrientationData {
    return { ...this.data };
  }

  public isSupported(): boolean {
    return "DeviceOrientationEvent" in window;
  }

  public test(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000);

      const handleTest = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          clearTimeout(timeout);
          window.removeEventListener("deviceorientation", handleTest);
          resolve(true);
        }
      };

      window.addEventListener("deviceorientation", handleTest, { once: true });
    });
  }

  public destroy() {
    window.removeEventListener("deviceorientation", this.handleOrientation);
    this.listeners = [];
  }
}

export const orientationSensor = new OrientationSensor();
