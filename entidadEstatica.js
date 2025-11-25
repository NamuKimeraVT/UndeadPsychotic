class EntidadEstatica extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.radio = 20;
    this.sprite = null;
    this.render();
    this.ancho = 100;
    this.alto = 100;
    this.crearCajitaDeMatterJS();
  }

  calcularRadio() {
    this.radio = (this.sprite.width + Math.sqrt(this.sprite.height)) * 0.25;
  }

  crearCajitaDeMatterJS() {
    this.body = Matter.Bodies.rectangle(
      this.posicion.x,
      this.posicion.y,
      this.ancho * 0.8,
      this.alto * 0.8,
      { isStatic: true, restitution: 0.1, friction: 0.1, frictionAir: 0.01 }
    );
    this.body.angle = Math.random() * 3;
    Matter.Composite.add(this.juego.engine.world, [this.body]);
  }
}