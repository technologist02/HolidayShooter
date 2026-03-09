export class InputController {
  constructor({ canvas, dragThresholdPx, onMove, onShoot }) {
    this.canvas = canvas;
    this.dragThresholdPx = dragThresholdPx;
    this.onMove = onMove;
    this.onShoot = onShoot;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.dragStartX = 0;
    this.keys = new Set();
    this.enabled = false;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  bind() {
    this.canvas.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    this.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    this.canvas.addEventListener("touchend", this.handleTouchEnd, { passive: false });
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("click", this.handleClick);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  unbind() {
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.canvas.removeEventListener("touchend", this.handleTouchEnd);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("click", this.handleClick);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  applyKeyboardStep(currentX) {
    if (!this.enabled) return currentX;
    const step = 10;
    let nextX = currentX;
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) {
      nextX -= step;
    }
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) {
      nextX += step;
    }
    return nextX;
  }

  toLocal(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  handleTouchStart = (event) => {
    event.preventDefault();
    const point = event.changedTouches[0];
    const local = this.toLocal(point.clientX, point.clientY);
    this.touchStartX = local.x;
    this.touchStartY = local.y;
    this.dragStartX = local.x;
  };

  handleTouchMove = (event) => {
    event.preventDefault();
    if (!this.enabled) return;
    const point = event.changedTouches[0];
    const local = this.toLocal(point.clientX, point.clientY);
    const dx = local.x - this.touchStartX;
    if (Math.abs(dx) > this.dragThresholdPx) {
      this.onMove(this.dragStartX + dx);
    }
  };

  handleTouchEnd = (event) => {
    event.preventDefault();
    if (!this.enabled) return;
    const point = event.changedTouches[0];
    const local = this.toLocal(point.clientX, point.clientY);
    const dx = local.x - this.touchStartX;
    const dy = local.y - this.touchStartY;
    if (Math.hypot(dx, dy) < this.dragThresholdPx * 2) {
      this.onShoot(local.x, local.y);
    }
  };

  handleMouseMove = (event) => {
    if (!this.enabled) return;
    const local = this.toLocal(event.clientX, event.clientY);
    this.onMove(local.x);
  };

  handleClick = (event) => {
    if (!this.enabled) return;
    const local = this.toLocal(event.clientX, event.clientY);
    this.onShoot(local.x, local.y);
  };

  handleKeyDown = (event) => {
    this.keys.add(event.code);
    if (!this.enabled) return;
    if (event.code === "Space") {
      event.preventDefault();
      this.onShoot(this.canvas.clientWidth / 2, this.canvas.clientHeight * 0.15);
    }
  };

  handleKeyUp = (event) => {
    this.keys.delete(event.code);
  };
}
