class Fuente extends EntidadEstatica {
    constructor(x, y, juego, scaleX, scaleY) {
        super(x, y, juego);
        this.radio = 10;
        this.tipo = Math.floor(Math.random()) + 1;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.container.label = "Fuente";
        this.crearSprite();
    }

    async crearSprite() {
        this.sprite = new PIXI.Sprite(await PIXI.Assets.load("assets/fuente.png"));
        this.sprite.anchor.set(1, 1);

        this.container.addChild(this.sprite);
        this.sprite.scale.x = this.scaleX;
        this.sprite.scale.y = this.scaleY;
        this.render();
    }
}