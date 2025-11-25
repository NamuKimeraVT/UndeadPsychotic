class Local extends EntidadEstatica {
    constructor(x, y, juego, scaleX) {
        super(x, y, juego);
        this.radio = 10;
        this.scaleX = scaleX || 1;
        this.container.label = "local" + this.id;
        this.crearSprite();
    }

    async crearSprite() {
        this.sprite = new PIXI.Sprite(await PIXI.Assets.load("assets/locales.png"));
        this.sprite.anchor.set(1, 1);
        this.container.addChild(this.sprite);
        this.sprite.scale.x = this.scaleX;
        this.render();
        this.container.zIndex = -1;
        console.log("Los Locales se insertaron")
    }
}