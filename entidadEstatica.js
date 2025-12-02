class EntidadEstatica extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.radio = 20;
    this.sprite = null;
    this.render();
  }

  calcularRadio() {
    this.radio = (this.sprite.width + Math.sqrt(this.sprite.height)) * 0.25;
  }

  crearCajitaDeMatterJS() {
    this.body = Matter.Bodies.rectangle(
      this.posicion.x,
      this.posicion.y - this.alto * 0.5,
      this.ancho,
      this.alto,
      { isStatic: true, restitution: 0.1, friction: 0.1, frictionAir: 0.01 }
    );
    this.body.angle = Math.random() * 3;
    this.body.gameObject = this;
    Matter.Composite.add(this.juego.engine.world, [this.body]);
  }

  tick() {
  }
}