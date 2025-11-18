class Palmera extends EntidadEstatica {
    constructor(x, y, juego, scaleX, scaleY) {
        super(x, y, juego);
        this.radio = 20;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.container.label = "Palmera";
        this.crearSprite();
    }

    async crearSprite() {
        this.sprite = new PIXI.Sprite(await PIXI.Assets.load("assets/palmera.png"));
        this.sprite.anchor.set(0.5, 0.5);
        this.container.addChild(this.sprite);
        this.sprite.scale.x = this.scaleX;
        this.sprite.scale.y = this.scaleY;
        this.render();
        console.log("La palmera se inserto correctamente")
    }
}