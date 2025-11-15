class Silla extends EntidadEstatica {
    constructor(x, y, juego, scaleX, scaleY) {
        super(x, y, juego);
        this.radio = 10;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.container.label = "silla";
        this.crearSprite();
    }

    async crearSprite() {
        this.sprite = new PIXI.Sprite(await PIXI.Assets.load("assets/silla.png"));
        this.sprite.anchor.set(0.5, 0.5);

        this.container.addChild(this.sprite);
        this.sprite.scale.x = this.scaleX;
        this.sprite.scale.y = this.scaleY;
        this.render();
        console.log("La silla se inserto correctamente")
    }
}