class Pared {
  constructor(juego, x1, y1, x2, y2) {
    this.juego = juego;
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.sprite = null;
    this.container = new PIXI.Container();
    this.container.label = "pared" + this.id;
    // this.angulo = calcularAngulo()
    this.crearSprite();
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(await PIXI.Assets.load("/assets/pared.png"));
    this.sprite.anchor.set(1, 1);
    this.container.addChild(this.sprite);
    this.sprite.scale.x = this.scaleX;
    this.container.zIndex = -1;
    console.log("Las Paredes se insertaron")
  }

  circuloIntersectaConmigo(cx, cy, r){
    intersectaLineaCirculo(cx, cy, r, x1, y1, x2, y2)
  }

  colisionoCon(persona){
    return intersectaLineaCirculo(persona.x, persona.y, persona.radio, this.x1, this.y1, this.x2, this.y2)
  }
}