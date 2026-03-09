function waveCount(wave) {
  return 5 + wave * 3;
}

function waveInterval(wave) {
  return Math.max(28, 110 - wave * 7);
}

function waveSpeed(wave) {
  return 0.9 + wave * 0.22;
}

export class GameEngine {
  constructor(mode) {
    this.mode = mode;
    this.state = "idle";
    this.phase = "crowd";
    this.width = 390;
    this.height = 600;
    this.reset();
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.cannon.x = width / 2;
    this.cannon.y = height - 56;
    this.cannon.targetX = this.cannon.x;
  }

  reset() {
    this.score = 0;
    this.wave = this.mode.difficulty.startWave;
    this.lives = this.mode.difficulty.baseLives;
    this.projectiles = [];
    this.enemies = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.spawnTimer = 0;
    this.shakeAmt = 0;
    this.lastShot = { x: this.width / 2, y: this.height / 2 };
    this.boss = null;
    this.phase = "crowd";
    this.cannon = {
      x: this.width / 2,
      y: this.height - 56,
      angle: -Math.PI / 2,
      targetX: this.width / 2
    };
    this.prepareWave();
    this.state = "idle";
  }

  prepareWave() {
    this.toSpawn = waveCount(this.wave);
    this.spawned = 0;
    this.spawnInterval = waveInterval(this.wave);
    this.enemySpeed = waveSpeed(this.wave);
    this.spawnTimer = 0;
    this.phase = "crowd";
    this.boss = null;
    this.enemyProjectiles = [];
  }

  start() {
    this.state = "playing";
  }

  pause() {
    this.state = "idle";
  }

  moveTargetX(nextX) {
    this.cannon.targetX = Math.max(30, Math.min(this.width - 30, nextX));
  }

  shootAt(x, y) {
    if (this.state !== "playing") return;
    const dx = x - this.cannon.x;
    const dy = y - this.cannon.y;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

    const length = Math.hypot(dx, dy) || 1;
    const speed = 16;
    this.projectiles.push({
      x: this.cannon.x,
      y: this.cannon.y - 18,
      vx: (dx / length) * speed,
      vy: (dy / length) * speed,
      life: 100,
      emoji: this.mode.projectile,
      size: Math.round(28 * (this.width / 390)),
      rotation: Math.atan2(dy, dx)
    });

    this.lastShot = { x, y };
    this.flashParticles(this.cannon.x, this.cannon.y - 18, dx / length, dy / length);
  }

  flashParticles(x, y, nx, ny) {
    for (let i = 0; i < 7; i += 1) {
      const a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 0.9;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * 7,
        vy: Math.sin(a) * 7,
        life: 14,
        maxLife: 14,
        color: this.mode.theme.glow,
        size: 5 + Math.random() * 5,
        emoji: null
      });
    }
  }

  spawnEnemy() {
    const emoji = this.mode.enemies[Math.floor(Math.random() * this.mode.enemies.length)];
    const size = Math.round((34 + Math.random() * 12) * (this.width / 390));
    this.enemies.push({
      x: 44 + Math.random() * (this.width - 88),
      y: -size,
      vx: (Math.random() - 0.5) * 1.4,
      vy: this.enemySpeed + Math.random() * 0.4,
      emoji,
      size,
      wobble: Math.random() * Math.PI * 2
    });
  }

  spawnBoss() {
    const bossCfg = this.mode.boss;
    const scale = this.width / 390;
    const maxHp = bossCfg.baseHp + Math.floor((this.wave - 1) * bossCfg.hpPerWave);
    this.boss = {
      x: this.width / 2,
      y: -58,
      vx: Math.random() > 0.5 ? 1 : -1,
      speed: bossCfg.baseSpeed + (this.wave - 1) * bossCfg.speedPerWave,
      size: Math.round(78 * scale),
      emoji: bossCfg.emoji,
      hp: maxHp,
      maxHp,
      attackTimer: 70,
      pauseFrames: 0,
      behavior: bossCfg.behavior ?? "default",
      rushTimer: 0,
      wobble: Math.random() * Math.PI * 2
    };
    this.phase = "boss";
  }

  spawnEnemyProjectile(x, y, emoji, speed, tx = this.cannon.x, ty = this.cannon.y) {
    const dx = tx - x;
    const dy = ty - y;
    const len = Math.hypot(dx, dy) || 1;
    this.enemyProjectiles.push({
      x,
      y,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      life: 160,
      size: Math.round(26 * (this.width / 390)),
      emoji
    });
  }

  explode(x, y, count = 8, color = this.mode.theme.accent, emoji = this.mode.projectile) {
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2;
      const s = 3 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 32,
        maxLife: 32,
        color,
        size: 10,
        emoji
      });
    }
  }

  applyBossHitReaction() {
    if (!this.boss) return;
    if (this.boss.behavior === "new-year") {
      this.boss.y -= 8;
    }
    if (this.boss.behavior === "valentine") {
      this.boss.rushTimer = 32;
    }
  }

  updateBoss() {
    if (!this.boss) return { gameOver: false };

    const b = this.boss;
    b.wobble += 0.05;

    const rushMul = b.behavior === "valentine" && b.rushTimer > 0 ? 1.8 : 1;
    if (b.rushTimer > 0) b.rushTimer -= 1;

    if (b.pauseFrames > 0) {
      b.pauseFrames -= 1;
      if (b.pauseFrames === 0) {
        this.spawnEnemyProjectile(
          b.x,
          b.y + b.size * 0.2,
          this.mode.boss.counterAttack.emoji,
          this.mode.boss.counterAttack.speed
        );
      }
    } else {
      b.x += b.vx * (1.25 + Math.sin(b.wobble) * 0.25);
      b.y += b.speed * rushMul;
    }

    if (b.x < b.size * 0.5) {
      b.x = b.size * 0.5;
      b.vx *= -1;
    }
    if (b.x > this.width - b.size * 0.5) {
      b.x = this.width - b.size * 0.5;
      b.vx *= -1;
    }

    b.attackTimer -= 1;
    if (b.attackTimer <= 0) {
      if (b.behavior === "new-year") {
        b.pauseFrames = 32;
      } else {
        this.spawnEnemyProjectile(
          b.x,
          b.y + b.size * 0.2,
          this.mode.boss.counterAttack.emoji,
          this.mode.boss.counterAttack.speed
        );
      }
      b.attackTimer = Math.max(42, this.mode.boss.counterAttack.cooldownFrames - (this.wave - 1) * 2);
    }

    if (b.y > this.height + b.size * 0.35) {
      this.lives = 0;
      this.state = "dead";
      return { gameOver: true };
    }

    return { gameOver: false };
  }

  updateEnemyProjectiles() {
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i -= 1) {
      const p = this.enemyProjectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      if (p.life <= 0 || p.y > this.height + 80 || p.x < -80 || p.x > this.width + 80) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (Math.hypot(p.x - this.cannon.x, p.y - this.cannon.y) < 26) {
        this.enemyProjectiles.splice(i, 1);
        this.lives -= 1;
        this.shakeAmt = 8;
        this.explode(this.cannon.x, this.cannon.y, 10, this.mode.theme.glow, this.mode.boss.counterAttack.emoji);
        if (this.lives <= 0) {
          this.state = "dead";
          return { gameOver: true };
        }
      }
    }
    return { gameOver: false };
  }

  step() {
    if (this.state !== "playing") {
      return { changed: false };
    }

    if (this.shakeAmt > 0) {
      this.shakeAmt *= 0.75;
      if (this.shakeAmt < 0.2) this.shakeAmt = 0;
    }

    this.cannon.x += (this.cannon.targetX - this.cannon.x) * 0.18;
    this.cannon.angle = -Math.PI / 2 + ((this.cannon.targetX - this.width / 2) / (this.width / 2)) * 0.3;

    if (this.phase === "crowd" && this.spawned < this.toSpawn) {
      this.spawnTimer += 1;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy();
        this.spawned += 1;
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      if (p.life <= 0 || p.y < -60 || p.x < -60 || p.x > this.width + 60) {
        this.projectiles.splice(i, 1);
        continue;
      }

      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
        const e = this.enemies[j];
        if (Math.hypot(p.x - e.x, p.y - e.y) < e.size * 0.6) {
          this.explode(e.x, e.y);
          this.enemies.splice(j, 1);
          this.score += 10 * this.wave;
          hit = true;
          break;
        }
      }

      if (hit) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (this.boss && Math.hypot(p.x - this.boss.x, p.y - this.boss.y) < this.boss.size * 0.56) {
        this.projectiles.splice(i, 1);
        this.boss.hp -= 1;
        this.applyBossHitReaction();
        this.flashParticles(this.boss.x, this.boss.y, 0, -1);

        if (this.boss.hp <= 0) {
          this.explode(this.boss.x, this.boss.y, 18, this.mode.theme.accent, this.mode.projectile);
          this.score += this.wave * 50 + this.mode.boss.deathBonus * this.wave;
          this.boss = null;
          this.phase = "nextWave";
          this.state = "idle";
          this.wave += 1;
          this.prepareWave();
          return { changed: true, bossDefeated: true, waveCompleted: true };
        }
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const e = this.enemies[i];
      e.wobble += 0.06;
      e.x += e.vx + Math.sin(e.wobble) * 0.5;
      e.y += e.vy;
      if (e.x < e.size / 2) {
        e.x = e.size / 2;
        e.vx *= -1;
      }
      if (e.x > this.width - e.size / 2) {
        e.x = this.width - e.size / 2;
        e.vx *= -1;
      }
      if (e.y > this.height + 30) {
        this.enemies.splice(i, 1);
        this.lives -= 1;
        this.shakeAmt = 8;
        if (this.lives <= 0) {
          this.state = "dead";
          return { changed: true, gameOver: true };
        }
      }
    }

    if (this.phase === "crowd" && this.spawned >= this.toSpawn && this.enemies.length === 0 && !this.boss) {
      this.spawnBoss();
      return { changed: true, bossSpawned: true };
    }

    const bossResult = this.updateBoss();
    if (bossResult.gameOver) {
      return { changed: true, gameOver: true };
    }

    const enemyProjectileResult = this.updateEnemyProjectiles();
    if (enemyProjectileResult.gameOver) {
      return { changed: true, gameOver: true };
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.88;
      p.vy *= 0.88;
      p.life -= 1;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    return { changed: true };
  }

  getBossMood() {
    if (!this.boss || this.boss.behavior !== "valentine") return null;
    const ratio = this.boss.hp / this.boss.maxHp;
    if (ratio >= 0.8) return "🙂";
    if (ratio >= 0.6) return "😕";
    if (ratio >= 0.4) return "😞";
    if (ratio >= 0.2) return "😢";
    return "💀";
  }

  getSnapshot() {
    return {
      state: this.state,
      phase: this.phase,
      score: this.score,
      lives: this.lives,
      wave: this.wave,
      shakeAmt: this.shakeAmt,
      cannon: this.cannon,
      projectiles: this.projectiles,
      enemyProjectiles: this.enemyProjectiles,
      enemies: this.enemies,
      boss: this.boss,
      bossMood: this.getBossMood(),
      particles: this.particles,
      mode: this.mode,
      width: this.width,
      height: this.height
    };
  }
}
