window.addEventListener('load', () => { 
    // canvas setup
    const canvas = document.querySelector('#canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1700; 
    canvas.height = 500; 

    class InputHandler {
        constructor(game) {
            this.game = game;

            window.addEventListener('keydown', event => {
                if ( ((event.key === 'ArrowUp')  
                    || (event.key === 'ArrowDown')
                )  && this.game.keys.indexOf(event.key) === -1) { 
                    this.game.keys.push(event.key);
                } else if (event.key === ' ') {
                    if(this.game.gameOver || this.game.isPause) return
                    this.game.player.shootUp();
                }
                else if (event.key === 'd') {
                    this.game.debug = !this.game.debug; 
                }
                else if (event.key === 'r') {
                    if(this.game.gameOver && this.game.score < this.game.winningScore) {    
                      this.game.handleRestart()
                    }
                }
                else if (event.key === 'c') {
                    if(this.game.gameOver  && this.game.score >= this.game.winningScore &&
                        this.game.player.player_lives
                        ) {    
                       this.game.handleLevelUp()
                    }
                }
                else if (event.key === 'p') {
                    this.game.isPause = !this.game.isPause; 
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
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 30;
            this.height = 10;
            this.speed = 5;
            this.damage = 2.5;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
        }
    
        update() {
            this.x += this.speed;
            if(this.x > this.game.width * 90 ) this.markedForDeletion = true;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y);         
        }
    }

    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() *  6 - 3;
            this.speedY = Math.random() *  -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle =0;
            this.va = Math.random() * 0.2 - 0.1; // velocity of angle
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 80 + 60; 
        }


        update() {
            this.angle += this.va;
            this.speedY += this.gravity;

            this.x -= this.speedX - this.game.speed;
            this.y += this.speedY ;
            if(this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;

            if( this.y > this.game.height - this.bottomBounceBoundary && !this.bounced && this.bounced < 2) {
                this.bounced++;
                this.speedY *= -0.5;
            }
        }

        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * 0.5, this.size, this.size);
        context.restore();
        }
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
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37
            this.player_lives= 10;
            this.projectiles = [];
            this.image = document.getElementById('player');

            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpInterval = 5000;
            this.shoot_sound = document.getElementById('shoot');
            this.sound_collision = document.getElementById('collision');
            this.sound_power_up = document.getElementById('power_up');
        }

        update(deltaTime) {
            // check player position is out of bounds
            if(this.y  > this.game.height  - this.height * 0.7) this.y = this.game.height - this.height * 0.7;
            else if(this.y < - this.height * 0.3) this.y = - this.height * 0.3;

            if(this.game.keys.includes('ArrowUp')) {
                this.speedY = -this.maxSpeed;
            }
            else if(this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            // Handle player projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });

            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            // Handle Power up
            if(this.powerUp) {
                if(this.powerUpTimer > this.powerUpInterval) {
                    this.powerUp = false;
                    this.powerUpTimer = 0;
                    this.frameY = 0;
                }else{
                    this.powerUpTimer += deltaTime;
                    this.frameY =1;
                    this.game.ammo +=0.1;
                }
            }
        }

        draw(context) {
           if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
          
            // Animate player image
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;

            // Draw projectiles
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });        
              // Draw player image
              context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width,  this.height,  this.x, this.y, this.width, this.height);    
        }
        
        shootUp() {
            if ( this.game.ammo > 0 ) {
                // play projectile sound and play only 1 second  
                this.projectiles.push(new Projectile(this.game, this.x  + this.width - 40, this.y + 30));
                this.game.ammo--;
            }
            if(this.powerUp) this.shootBottom();
        }

        shootBottom() {
            this.projectiles.push(new Projectile(this.game, this.x  + this.width - 40, this.y + 175));
            this.game.ammo--;
        }

        enterPowerUp() {
            this.powerUp = true;
            this.powerUpTimer = 0;
            this.game.ammo = this.game.maxAmmo;
            this.player_lives += 2;
            this.sound_power_up.play();
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5 * 3;
            this.lives = 5;
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37
        }

        update() {
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0) this.markedForDeletion = true;
            // sprite animation
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }

        draw(context) {
           if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);  
            context.drawImage(this.image,  this.frameX * this.width, this.frameY * this.width, this.width, this.height, this.x, this.y ,this.width, this.height);
            context.font = "20px Helvetica";
            if(this.game.debug) context.fillText(this.lives, this.x, this.y);
        }
    }

    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;   
            this.y = Math.random() * (this.game.height  * 0.95 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY =  Math.floor(Math.random() * 3);
        }
    }


    class Angler2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 156;   
            this.lives = 7.5;
            this.y = Math.random() * (this.game.height  * 0.95 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY =  Math.floor(Math.random() * 2);
        }
    }


    class LuckyFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;   
            this.lives = 2;
            this.score = 10;
            this.y = Math.random() * (this.game.height  * 0.95 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY =  Math.floor(Math.random() * 2);
            this.type = 'lucky';
        }
    }

    class HiveWhales extends Enemy {
        constructor(game) {
            super(game);
            this.width = 400;
            this.height = 272;   
            this.lives = 20;
            this.score = this.lives;
            this.y = Math.random() * (this.game.height  * 0.95 - this.height);
            this.image = document.getElementById('hivewhale');
            this.frameY =  Math.floor(Math.random() * 2);
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }

    class Layer{
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768
            this.height = 500
            this.x = 0;
            this.y = 0;
        }
        update() {
            if(this.x < -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);   
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class background {
        constructor(game) {
            this.game = game;

            this.image1 =  document.getElementById('layer1');
            this.image2 =  document.getElementById('layer2');
            this.image3 =  document.getElementById('layer3');
            this.image4 =  document.getElementById('layer4');

            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 0.5);
            this.layer4 = new Layer(this.game, this.image4, 1.5);

            this.layers =[this.layer1, this.layer2, this.layer3];
        }

        update() {
            this.layers.forEach(layer => {
                layer.update();
            })
        }

        draw(context) {
            this.layers.forEach(layer => {
                layer.draw(context);
            })
        }

    }

    class UI{
        constructor(game) {
            this.game = game;
            this.fontSize = 30;
            this.fontFamily = 'Bangers';
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

            // score
            context.fillStyle = 'White';
            context.fillText(`Ammo: ${parseInt(this.game.ammo)}`, 20, 80);
            context.fillText(`Lives: ${this.game.player.player_lives.toFixed(2)}`, 20, 40);

            // score
            context.fillStyle = 'White';
            context.fillText(`Score: ${this.game.score}`, 160, 40);

            if(this.game.player.powerUp)  context.fillStyle = 'Yellow';

            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + (i * 10), 100, 5, 40);
            }  

             // score to go to next level
             context.fillStyle = 'green';
             context.fillText(`Goal Score: ${parseInt(this.game.winningScore)}`, 520,40);

            // game time on screen
            context.fillStyle = 'White';
            context.fillText(`Time: ${Math.floor(this.game.gameTime / 100)}`, 320, 40); 
            

            if (this.game.gameOver) {
                    context.textAlign = 'center';
                    let message1 = 'Game Over';
                    let message2 = 'Press space to restart';
                    if(game.score >= game.winningScore) {
                        message1 = 'Congrats Level UP';
                        message2 = 'Well done Press C to continue';
                    }else {
                        message1 = ' Game Over Loser ';
                        message2 = 'Press R to restart';
                    }
                    context.font = "60px "+ this.fontFamily;
                    context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);

                    context.font = "30px "+ this.fontFamily;
                    context.fillText(message2, this.game.width * 0.5, this.game.height * 0.6);
            }

            if (this.game.isPause) {
                context.textAlign = 'center';
                let message1 = 'Game Paused';
                let message2 = 'Press p to resume';
                context.font = "60px "+ this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);

                context.font = "30px "+ this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.6);
            }
            // show new winning score
            context.restore()
        }    
    }

    class Game {
        constructor(width, height) {
            this.debug = false;
            this.width = width;
            this.height = height;
            this.inputHandler = new InputHandler(this);
            this.background = new background(this);
            this.player = new Player(this);
            this.ui = new UI(this);
    
            this.keys = [];
            this.enemies = [];
            this.particles = [];

            this.ammo = 20;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.maxAmmo = 50;
            this.gameOver = false;

            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.score = 0;
            this.winningScore = 50;
            this.gameTime = 0;
            this.timeLimit = 60000;
            this.speed = 1;
            this.sound_level_up = document.getElementById('level_up');
            this.sound_game_over = document.getElementById('game_over');
            this.isPause = 0
            
        }

        update( deltaTime) {
            if(this.gameOver || this.isPause) return;
            
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            // updated background
            if(!this.gameOver) this.background.update();

            // draw layer 4
            this.background.layer4.update();

            this.player.update(deltaTime);
            if(this.ammoTimer > this.ammoInterval ) {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            }else{
                this.ammoTimer += deltaTime;
            }
            
            // handle particles
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
                        
            this.enemies.forEach(enemy => {
                enemy.update();

                if(this.checkCollision(this.player, enemy)) {

                    if(enemy.type =='lucky') this.player.enterPowerUp();
                    
                    else { 
                        this.player.player_lives--;
                    
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5 - this.player.width * 0.5, enemy.y + enemy.height * 0.5 - this.player.height * 0.5));
                        this.player.sound_collision.play()
                    };

                   
                    enemy.markedForDeletion = true;  
                    if(this.player.player_lives <= 0) {
                        this.gameOver = true;
                    }  

                }

                this.player.projectiles.forEach(projectile => { 

                    if(this.checkCollision(projectile, enemy)) {
                        if(enemy.type == "lucky") this.player.player_lives -= 1;
                        enemy.lives -= enemy.type != "lucky" ? projectile.damage : this.player.player_lives * 0.1;
                        projectile.markedForDeletion = true;

                           // create particles
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        
                        if(enemy.lives <= 0) {
                            for (let i = 0; i < 8; i++) {
                                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                            } 

                            enemy.markedForDeletion = true;
                            this.player.shoot_sound.play();

                           if( !this.gameOver) this.score += enemy.score;
                            if(this.score >= this.winningScore) {
                                this.gameOver = true;
                                this.sound_level_up.play();
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
            this.checkIfEnemyPassPlayer();
        }
        

        draw(context) {
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
        
            this.particles.forEach(particle => particle.draw(context));

            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
           this.background.layer4.draw(context);
        }

        addEnemy() {
            const randomize = Math.random() ;
            if(randomize < 0.3) this.enemies.push(new Angler1(this));
            if(randomize < 0.6) this.enemies.push(new Angler2(this));
            if(randomize < 0.7) this.enemies.push(new HiveWhales(this));
            else this.enemies.push(new LuckyFish(this));
        }

        checkCollision(rect1, rect2) {
            return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y) 
        }

        checkIfEnemyPassPlayer() {
            this.enemies.forEach(enemy => {
                if (enemy.type != 'lucky' && enemy.x < -10 ) {
                    this.player.player_lives -= 0.3;
                    enemy.markedForDeletion = true;
                    if(this.player.player_lives <= 0) {
                        this.gameOver = true;
                    }  
                }
            })
        }

        handleLevelUp() {
            this.gameOver = false;
            this.enemyInterval *= 0.8;
            this.speed += 1;
            this.winningScore *= 2;
            this.ammo += 5;
            this.ammoInterval += 10;
            this.player.player_lives = 10;
            this.gameTime = 0;
            this.timeLimit += 30000;
            this.sound_level_up.play();

        }

        handleRestart() {
            this.gameOver = false;
            this.player.player_lives = 10;
            this.winningScore = 50;
            this.gameTime = 0;
            this.ammo = 50;
            this.score = 0;
            this.enemies = [];
            this.enemyInterval = 1000;
            this.speed = 1;
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
    // TODO
    // 1. If player collide with lucky fish, player gets power up -Done
    // 2. If player kill lucky fish remove 1 lives from player - Done
    // 3. If player has power up, player can shoot from top and bottom - Done
    // Enemies pass through player removed player lives - Done
     // If enemy not kill by payer remove 0.5 live from player  - Done 
     // handle pause game
    // -- HAndle Particle effect

})