class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;  // Display size
        this.height = 48; // Display size
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = -12;
        this.gravity = 0.6;
        this.friction = 0.8;
        this.grounded = false;
        this.facingRight = true;
        this.invincible = false;
        this.invincibleTime = 0;
        
        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.state = 'idle'; // idle, walk, jump
        
        // Sprite info (from XML - each sprite is 128x128)
        // Using character_beige: idle(645,0), walk_a(0,129), walk_b(129,129), jump(774,0)
        this.sprites = {
            idle: { x: 645, y: 0, w: 128, h: 128 },
            walk: [
                { x: 0, y: 129, w: 128, h: 128 },    // walk_a
                { x: 129, y: 129, w: 128, h: 128 }  // walk_b
            ],
            jump: { x: 774, y: 0, w: 128, h: 128 }
        };
        
        // Load sprite
        this.sprite = new Image();
        this.sprite.src = 'assets/spritesheet-characters-default.png';
    }

    update(deltaTime, platforms, enemies, coins) {
        // Handle input
        if (input.isPressed('left')) {
            this.velocityX = -this.speed;
            this.facingRight = false;
            this.state = 'walk';
        } else if (input.isPressed('right')) {
            this.velocityX = this.speed;
            this.facingRight = true;
            this.state = 'walk';
        } else {
            this.velocityX *= this.friction;
            if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
            if (this.grounded) this.state = 'idle';
        }

        // Jump
        if (input.isPressed('jump') && this.grounded) {
            this.velocityY = this.jumpPower;
            this.grounded = false;
            this.state = 'jump';
            soundManager.play('jump');
        }

        // Apply gravity
        this.velocityY += this.gravity;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Platform collision
        this.grounded = false;
        for (const platform of platforms) {
            if (this.checkCollision(platform)) {
                // Landing on top
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.grounded = true;
                }
                // Hitting from below
                else if (this.velocityY < 0 && this.y > platform.y) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // Side collision
                else if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                    this.velocityX = 0;
                } else if (this.velocityX < 0) {
                    this.x = platform.x + platform.width;
                    this.velocityX = 0;
                }
            }
        }

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > 800 - this.width) this.x = 800 - this.width;
        if (this.y > 600) {
            return 'died'; // Fell off screen
        }

        // Enemy collision
        if (!this.invincible) {
            for (const enemy of enemies) {
                if (this.checkCollision(enemy)) {
                    // Jump on enemy
                    if (this.velocityY > 0 && this.y < enemy.y + enemy.height / 2) {
                        enemy.dead = true;
                        this.velocityY = -8;
                        soundManager.play('magic');
                        return 'enemyKilled';
                    } else {
                        this.invincible = true;
                        this.invincibleTime = 60;
                        soundManager.play('hurt');
                        return 'hit';
                    }
                }
            }
        }

        // Coin collection
        for (let i = coins.length - 1; i >= 0; i--) {
            if (this.checkCollision(coins[i])) {
                coins.splice(i, 1);
                soundManager.play('coin');
                return 'coin';
            }
        }

        // Update invincibility
        if (this.invincible) {
            this.invincibleTime--;
            if (this.invincibleTime <= 0) {
                this.invincible = false;
            }
        }

        // Update animation
        this.animTimer++;
        if (this.animTimer > 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }

        return null;
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    draw(ctx) {
        ctx.save();
        
        // Flash when invincible
        if (this.invincible && Math.floor(this.invincibleTime / 4) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Get current sprite
        let sprite;
        if (this.state === 'idle') {
            sprite = this.sprites.idle;
        } else if (this.state === 'walk') {
            sprite = this.sprites.walk[this.animFrame];
        } else if (this.state === 'jump') {
            sprite = this.sprites.jump;
        }

        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }
        
        // Draw the full sprite centered
        ctx.drawImage(
            this.sprite,
            sprite.x, sprite.y, sprite.w, sprite.h,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        
        ctx.restore();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.invincible = false;
        this.invincibleTime = 0;
    }
}
