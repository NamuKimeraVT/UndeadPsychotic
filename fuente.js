class Fuente extends EntidadEstatica {
    constructor(x, y, juego, scaleX, scaleY) {
        super(x, y, juego);
        this.radio = 10;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.ancho = 200;
        this.alto = 100;
        this.container.label = "Fuente" + this.id;
        this.crearSprite();
        this.crearCajitaDeMatterJS();
    }

    async crearSprite() {
        this.sprite = new PIXI.Sprite(await PIXI.Assets.load("assets/fuente.png"));
        this.sprite.anchor.set(0.5, 1);
        this.container.addChild(this.sprite);
        this.sprite.scale.x = this.scaleX;
        this.sprite.scale.y = this.scaleY;
        this.container.zIndex = 1;
        this.render();
        console.log("La fuente se inserto correctamente")
    }
}