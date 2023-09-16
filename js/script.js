window.addEventListener('load', () => { 
    // canvas setup
    const canvas = document.querySelector('#canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1500; //window.innerWidth;
    canvas.height = 500; //window.innerHeight;

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', event => {
                if ( ((event.key === 'ArrowUp')  
                    || (event.key === 'ArrowDown')
                )  && this.game.keys.indexOf(event.key) === -1) { 
                    this.game.keys.push(event.key);
                }else if (event.key === ' ') {
                    this.game.player.shootUp();
                }
            });

            window.addEventListener('keyup', event => {
                if( this.game.keys.indexOf(event.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
                }
            });
        }
    }

    class Projectile {  
        constructor(game, x, y) {``
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 100;
            this.height = 10;
            this.speed = 90;
            this.markedForDeletion = false;
        }
        update() {
            this.x += this.speed;
            if(this.x > this.game.width * 90 ) this.markedForDeletion = true;
        }

        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height );
        }
    }

    class Particle {

    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;   
            this.x = 20;
            this.y = 160;
            this.speedY = 0; 
            this.maxSpeed = 5;
            this.player_lives= 5;
            this.projectiles = [];

        }

        update() {
            if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            // Handle player projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }

        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            // Draw projectiles
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });

            context.fillStyle = 'red';
            context.font = "40px Helvetica";
            context.fillText(this.player_lives, this.x, this.y);
            
        }

        shootUp() {
            if ( this.game.ammo > 0 ) {
                this.projectiles.push(new Projectile(this.game, this.x + this.width, this.y));
                this.game.ammo--;
            }
        }
    }

    class Enemy {
        constructor( game ) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.lives = 5;
            this.score = this.lives;
        }

        update() {
            this.x += this.speedX;
            if(this.x + this.width < 0) this.markedForDeletion = true;
        }

        draw(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);  
            context.fillStyle = 'black';
            context.font = "20px Helvetica";
            context.fillText(this.lives, this.x, this.y);
        }
    }

    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;   
            this.y = Math.random() * (this.game.height  * 0.9- this.height);

        }
    }

    class Layer{

    }

    class background {

    }

    class UI{
        constructor(game) {
            this.game = game;
            this.fontSize = 30;
            this.fontFamily = 'Helvetica';
            this.color = 'yellow';
        }   
        draw(context) {
            context.save()
            context.fillStyle = this.color;
            context.font = `${this.fontSize}px ${this.fontFamily}`;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.shadowBlur = 2;

            context.fillText(`Ammo: ${this.game.ammo}`, 20, 80);
            context.fillText(`Lives: ${this.game.player.player_lives}`, 20, 40);

            // score
            context.fillStyle = 'White';
            context.fillText(`Score: ${this.game.score}`, 140, 40);

            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + (i * 10), 100, 5, 40);
            }  
            // game time on screen
            context.fillStyle = 'White';
            context.fillText(`Time: ${Math.floor(this.game.gameTime / 1000)}`, 280, 40); 

            if (this.game.gameOver) {
                    context.textAlign = 'center';
                    let message1 = 'Game Over';
                    let message2 = 'Press space to restart';
                    if(game.score >= game.winningScore) {
                        message1 = 'You Win!';
                        message2 = 'Well done Press Enter to restart';
                    }else{
                        message1 = 'Game Over';
                        message2 = 'Press Enter to restart';
                    }
                    context.font = "60px "+ this.fontFamily;
                    context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);

                    context.font = "30px "+ this.fontFamily;
                    context.fillText(message2, this.game.width * 0.5, this.game.height * 0.6);
            }
            context.restore()
        }    
    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.inputHandler = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.ammo = 20;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.maxAmmo = 50;
            this.gameOver = false;

            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0;
            this.timeLimit = 10000;
            
        }

        update( deltaTime) {
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
                  
            this.player.update();
            if(this.ammoTimer > this.ammoInterval ) {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            }else{
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy => {
                enemy.update();
                if(this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;    
                    this.player.player_lives--;
                }

                this.player.projectiles.forEach(projectile => { 
                    if(this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if(enemy.lives <= 0) {
                            enemy.markedForDeletion = true;
                           if( !this.gameOver) this.score += enemy.score;
                            if(this.score >= this.winningScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                })
            })

            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyInterval  && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            }else{
                this.enemyTimer += deltaTime;
            }
        }

        draw(context) {
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
        }
        addEnemy() {
            this.enemies.push(new Angler1(this));
        }

        checkCollision(rect1, rect2) {
            return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y) 
            }
    } 

    const game = new Game(canvas.width, canvas.height);

    let lastTime = 0;

    // Animate game loop
    function animate (timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
 
})