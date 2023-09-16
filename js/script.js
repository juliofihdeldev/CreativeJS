window.addEventListener('load', () => { 
    // canvas setup
    const canvas = document.querySelector('#canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1500; //window.innerWidth;
    canvas.height = 500; //window.innerHeight;

    class InputHandler {
       
    }

    class Projectile {

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
        }
        update() {
            this.y += this.speedY;
        }

        draw(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
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