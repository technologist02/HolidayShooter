export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = 390;
    this.height = 600;
    this.dpr = 1;
    this.bgStars = null;
  }

  resize(width, height, dpr) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.bgStars = null;
  }

  draw(snapshot) {
    const ctx = this.ctx;
    let sx = 0;
    let sy = 0;
    if (snapshot.shakeAmt > 0) {
      sx = (Math.random() - 0.5) * snapshot.shakeAmt;
      sy = (Math.random() - 0.5) * snapshot.shakeAmt;
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = snapshot.mode.theme.bg;
    ctx.fillRect(-20, -20, this.width + 40, this.height + 40);

    this.drawStars(snapshot);
    this.drawGround(snapshot);
    this.drawParticles(snapshot);
    this.drawProjectiles(snapshot);
    this.drawEnemies(snapshot);
    this.drawCannon(snapshot);

    ctx.restore();
  }

  drawStars(snapshot) {
    const ctx = this.ctx;
    if (!this.bgStars) {
      this.bgStars = [];
      for (let i = 0; i < 56; i += 1) {
        this.bgStars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          r: Math.random() * 1.8 + 0.3,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    for (const star of this.bgStars) {
      star.phase += 0.004;
      ctx.globalAlpha = 0.08 + 0.07 * Math.sin(star.phase);
      ctx.fillStyle = snapshot.mode.theme.glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawGround(snapshot) {
    const ctx = this.ctx;
    const groundHeight = Math.round(this.height * 0.08);
    const gradient = ctx.createLinearGradient(0, this.height - groundHeight, 0, this.height);
    gradient.addColorStop(0, `${snapshot.mode.theme.accent}55`);
    gradient.addColorStop(1, `${snapshot.mode.theme.accent}18`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, this.height - groundHeight, this.width, groundHeight);

    ctx.strokeStyle = "rgba(255,60,60,.25)";
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, this.height - groundHeight);
    ctx.lineTo(this.width, this.height - groundHeight);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawParticles(snapshot) {
    const ctx = this.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of snapshot.particles) {
      const t = p.life / p.maxLife;
      ctx.globalAlpha = t;
      if (p.emoji) {
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawProjectiles(snapshot) {
    const ctx = this.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of snapshot.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation + Math.PI / 2);
      ctx.font = `${p.size}px serif`;
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
  }

  drawEnemies(snapshot) {
    const ctx = this.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const e of snapshot.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.shadowColor = snapshot.mode.theme.glow;
      ctx.shadowBlur = 8;
      ctx.font = `${e.size}px serif`;
      ctx.fillText(e.emoji, 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  drawCannon(snapshot) {
    const ctx = this.ctx;
    const { cannon } = snapshot;
    const scale = this.width / 390;

    ctx.save();
    ctx.translate(cannon.x, cannon.y);

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 36 * scale);
    glow.addColorStop(0, `${snapshot.mode.theme.accent}55`);
    glow.addColorStop(1, `${snapshot.mode.theme.accent}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 36 * scale, 0, Math.PI * 2);
    ctx.fill();

    const baseR = 22 * scale;
    const baseGradient = ctx.createRadialGradient(-4 * scale, -4 * scale, 2, 0, 0, baseR);
    baseGradient.addColorStop(0, "#666");
    baseGradient.addColorStop(1, "#1e1e1e");
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.arc(0, 0, baseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5 * scale;
    ctx.strokeStyle = snapshot.mode.theme.accent;
    ctx.stroke();

    ctx.rotate(cannon.angle);
    const barrelLength = 44 * scale;
    const barrelWidth = 12 * scale;
    const barrelGradient = ctx.createLinearGradient(0, -barrelWidth / 2, 0, barrelWidth / 2);
    barrelGradient.addColorStop(0, "#999");
    barrelGradient.addColorStop(0.45, "#ddd");
    barrelGradient.addColorStop(1, "#444");
    ctx.fillStyle = barrelGradient;
    ctx.beginPath();
    ctx.roundRect(8 * scale, -barrelWidth / 2, barrelLength, barrelWidth, 3 * scale);
    ctx.fill();

    ctx.fillStyle = snapshot.mode.theme.accent;
    ctx.beginPath();
    ctx.arc(8 * scale + barrelLength, 0, barrelWidth / 2 + 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(8 * scale + barrelLength, 0, barrelWidth / 2 - 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
