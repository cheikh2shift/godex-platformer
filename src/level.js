class Level {
    constructor() {
        this.platforms = [];
        this.enemies = [];
        this.coins = [];
        this.particles = [];
        this.flag = null;
        this.tileSize = 32; // Tiles are 32x32
        
        // Load sprites
        this.tileSprite = new Image();
        this.tileSprite.src = 'assets/spritesheet-tiles-default.png';
        this.enemySprite = new Image();
        this.enemySprite.src = 'assets/spritesheet-enemies-default.png';
        this.backgroundSprite = new Image();
        this.backgroundSprite.src = 'assets/spritesheet-backgrounds-default.png';
        
        this.generateLevel();
    }

    generateLevel() {
        // Ground platforms - using block_brown at x=325, y=65 (64x64 in sheet, scaled to 32x32)
        for (let x = 0; x < 800; x += 32) {
            this.platforms.push({
                x: x,
                y: 560,
                width: 32,
                height: 40,
                type: 'ground',
                spriteX: 325,
                spriteY: 65,
                spriteW: 64,
                spriteH: 64
            });
        }

        // Platform layout - using brick_brown
        const platformData = [
            { x: 200, y: 450, w: 3 },
            { x: 400, y: 380, w: 3 },
            { x: 600, y: 300, w: 3 },
            { x: 100, y: 280, w: 2 },
            { x: 300, y: 200, w: 4 },
            { x: 550, y: 150, w: 2 },
            { x: 50, y: 150, w: 2 },
            { x: 700, y: 450, w: 2 },
        ];

        for (const p of platformData) {
            for (let i = 0; i < p.w; i++) {
                this.platforms.push({
                    x: p.x + i * 32,
                    y: p.y,
                    width: 32,
                    height: 32,
                    type: 'platform',
                    spriteX: 325,
                    spriteY: 65,
                    spriteW: 64,
                    spriteH: 64
                });
            }
        }

        // Enemies - using ladybug (walk_a: x=130, y=195, walk_b: x=195, y=195)
        // Positioned so they sit on the ground (y = 560 - 32 = 528)
        this.enemies.push(
            new Enemy(250, 528, 100, 2, 'ladybug'),
            new Enemy(450, 528, 80, 2, 'ladybug'),
            new Enemy(420, 348, 60, 1.5, 'ladybug'),
            new Enemy(620, 268, 60, 1.5, 'ladybug'),
            new Enemy(350, 168, 100, 2, 'ladybug')
        );

        // Coins - using block_coin at x=65, y=0
        const coinPositions = [
            { x: 216, y: 410 },
            { x: 432, y: 340 },
            { x: 632, y: 260 },
            { x: 116, y: 240 },
            { x: 332, y: 160 },
            { x: 366, y: 160 },
            { x: 566, y: 110 },
            { x: 66, y: 110 },
            { x: 716, y: 410 },
            { x: 500, y: 520 },
            { x: 600, y: 520 },
            { x: 700, y: 520 },
        ];

        for (const pos of coinPositions) {
            this.coins.push({
                x: pos.x,
                y: pos.y,
                width: 24,
                height: 24,
                spriteX: 65,
                spriteY: 0,
                spriteW: 64,
                spriteH: 64
            });
        }

        // End flag
        this.flag = {
            x: 750,
            y: 480,
            width: 32,
            height: 80
        };
    }

    update() {
        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update();
        }
        // Remove dead enemies
        this.enemies = this.enemies.filter(e => !e.dead);

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, 800, 600);

        // Draw clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(100, 80, 30, 0, Math.PI * 2);
        ctx.arc(140, 70, 40, 0, Math.PI * 2);
        ctx.arc(180, 80, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(600, 120, 25, 0, Math.PI * 2);
        ctx.arc(635, 110, 35, 0, Math.PI * 2);
        ctx.arc(670, 120, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw platforms
        for (const platform of this.platforms) {
            ctx.drawImage(
                this.tileSprite,
                platform.spriteX, platform.spriteY, platform.spriteW, platform.spriteH,
                platform.x, platform.y, platform.width, platform.height
            );
        }

        // Draw coins
        for (const coin of this.coins) {
            ctx.drawImage(
                this.tileSprite,
                coin.spriteX, coin.spriteY, coin.spriteW, coin.spriteH,
                coin.x, coin.y, coin.width, coin.height
            );
        }

        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(ctx, this.enemySprite);
        }

        // Draw flag
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.flag.x, this.flag.y, 4, this.flag.height);
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(this.flag.x + 4, this.flag.y);
        ctx.lineTo(this.flag.x + 30, this.flag.y + 20);
        ctx.lineTo(this.flag.x + 4, this.flag.y + 40);
        ctx.fill();

        // Draw particles
        for (const p of this.particles) {
            ctx.fillStyle = `rgba(241, 196, 15, ${p.life / 30})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
    }

    spawnParticles(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30,
                size: Math.random() * 4 + 2
            });
        }
    }

    checkWin(player) {
        return player.x + player.width > this.flag.x &&
               player.x < this.flag.x + this.flag.width &&
               player.y + player.height > this.flag.y &&
               player.y < this.flag.y + this.flag.height;
    }
}

class Enemy {
    constructor(x, y, patrolDistance, speed, type) {
        this.x = x;
        this.y = y;
        this.width = 32;  // Display size
        this.height = 32; // Display size
        this.startX = x;
        this.patrolDistance = patrolDistance;
        this.speed = speed;
        this.direction = 1;
        this.dead = false;
        this.type = type;
        this.animFrame = 0;
        this.animTimer = 0;
        
        // Sprite coordinates for ladybug (from XML)
        // walk_a: x=130, y=195, walk_b: x=195, y=195 (64x64 in sheet)
        this.sprites = [
            { x: 130, y: 195, w: 64, h: 64 },
            { x: 195, y: 195, w: 64, h: 64 }
        ];
    }

    update() {
        this.x += this.speed * this.direction;
        
        if (this.x > this.startX + this.patrolDistance) {
            this.direction = -1;
        } else if (this.x < this.startX) {
            this.direction = 1;
        }

        this.animTimer++;
        if (this.animTimer > 10) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }
    }

    draw(ctx, sprite) {
        const s = this.sprites[this.animFrame];
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(
            sprite,
            s.x, s.y, s.w, s.h,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        ctx.restore();
    }
}
