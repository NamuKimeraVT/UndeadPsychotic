class Palmera extends EntidadEstatica {
    constructor(x, y, juego, scaleX, scaleY) {
        super(x, y, juego);
        this.radio = 20;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.container.label = "Palmera" + this.id;
        this.crearSprite();
        this.crearCajitaDeMatterJS();
    }

    async crearSprite() {
        this.sprite = new PIXI.Sprite(await PIXI.Assets.load("assets/palmera.png"));
        this.sprite.anchor.set(1, 1);
        this.container.addChild(this.sprite);
        this.sprite.scale.x = this.scaleX;
        this.sprite.scale.y = this.scaleY;
        this.container.zIndex = 1;
        this.render();
        console.log("La palmera se inserto correctamente")
    }

    crearCajitaDeMatterJS() {
        this.cajita = Matter.Bodies.rectangle(
            this.posicion.x,
            this.posicion.y,
            this.ancho * 0.8,
            this.alto * 0.8,
            { restitution: 0.1, friction: 0.1, frictionAir: 0.01 }
        );
        this.cajita.angle = Math.random() * 3;
        Matter.Composite.add(this.juego.engine.world, [this.cajita]);
    }

    tick() {
        super.tick();
    }
}