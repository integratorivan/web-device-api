export interface AccelerationData {
  x: number;
  y: number;
  z: number;
}

export interface RotationRateData {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface MotionData {
  acceleration: AccelerationData;
  accelerationIncludingGravity: AccelerationData;
  rotationRate: RotationRateData;
  interval: number;
  motionDetected: boolean;
  timestamp: number;
  isValid: boolean;
}

export class MotionSensor {
  private data: MotionData = {
    acceleration: { x: 0, y: 0, z: 0 },
    accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    interval: 0,
    motionDetected: false,
    timestamp: 0,
    isValid: false,
  };

  private listeners: ((data: MotionData) => void)[] = [];
  private motionThreshold = 1.0; // порог для определения движения

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener("devicemotion", this.handleMotion);
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.acceleration || { x: 0, y: 0, z: 0 };
    const accelerationIncludingGravity = event.accelerationIncludingGravity || {
      x: 0,
      y: 0,
      z: 0,
    };
    const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

    const totalAcceleration = Math.abs(
      (acceleration.x || 0) + (acceleration.y || 0) + (acceleration.z || 0),
    );

    this.data = {
      acceleration: {
        x: parseFloat((acceleration.x || 0).toFixed(2)),
        y: parseFloat((acceleration.y || 0).toFixed(2)),
        z: parseFloat((acceleration.z || 0).toFixed(2)),
      },
      accelerationIncludingGravity: {
        x: parseFloat((accelerationIncludingGravity.x || 0).toFixed(2)),
        y: parseFloat((accelerationIncludingGravity.y || 0).toFixed(2)),
        z: parseFloat((accelerationIncludingGravity.z || 0).toFixed(2)),
      },
      rotationRate: {
        alpha: parseFloat((rotationRate.alpha || 0).toFixed(2)),
        beta: parseFloat((rotationRate.beta || 0).toFixed(2)),
        gamma: parseFloat((rotationRate.gamma || 0).toFixed(2)),
      },
      interval: event.interval || 0,
      motionDetected: totalAcceleration > this.motionThreshold,
      timestamp: event.timeStamp || Date.now(),
      isValid: true,
    };

    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.data));
  }

  public subscribe(callback: (data: MotionData) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getData(): MotionData {
    return { ...this.data };
  }

  public isSupported(): boolean {
    return "DeviceMotionEvent" in window;
  }

  public setMotionThreshold(threshold: number) {
    this.motionThreshold = threshold;
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

      const handleTest = (event: DeviceMotionEvent) => {
        if (event.acceleration || event.rotationRate) {
          clearTimeout(timeout);
          window.removeEventListener("devicemotion", handleTest);
          resolve(true);
        }
      };

      window.addEventListener("devicemotion", handleTest, { once: true });
    });
  }

  public destroy() {
    window.removeEventListener("devicemotion", this.handleMotion);
    this.listeners = [];
  }
}

export const motionSensor = new MotionSensor();
