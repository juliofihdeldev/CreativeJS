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
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 30;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        update() {
            this.x += this.speed;
            if(this.x > this.game.width * 0.80 ) this.markedForDeletion = true;
        }

        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height + 20);
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
            this.y = 100;
            this.speedY = 0; 
            this.maxSpeed = 3;
            this.projectiles = [];
   
        }

        update() {
            if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            // handle player projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }

        draw(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            // draw projectiles
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }

        shootUp() {
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + this.width, this.y));
                this.game.ammo--;
            }
        }
    }

    class Enemy {

    }

    class Layer{

    }

    class background {

    }

    class UI{

    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.inputHandler = new InputHandler(this);
            this.keys = [];
            this.ammo = 20;
        }
        update() {
            this.player.update();
        }
        draw(context) {
            this.player.draw(context);
        }
    } 

    const game = new Game(canvas.width, canvas.height);

    // animate loop
    function animate () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate();
 
})