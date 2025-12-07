class Persona extends GameObject {
  spritesAnimados = {};
  constructor(x, y, juego) {
    super(x, y, juego);
    this.container.label = "persona - " + this.id;
    this.muerto = false;
    this.nombre = generateName();
    this.ancho = 32;
    this.alto = 32;
    this.vida = 100;
    this.vidaMaxima = 100;
    this.crearCajitaDeMatterJS();
  }
  crearCajitaDeMatterJS() {
    this.body = Matter.Bodies.rectangle(
      this.posicion.x,
      this.posicion.y,
      this.ancho * 0.8,
      this.alto * 0.8,
      { restitution: 0, friction: 0.5, frictionAir: 0.02 }
    );
    this.body.angle = Math.random() * 3;
    this.body.gameObject = this;
    Matter.Composite.add(this.juego.engine.world, [this.body]);
  }
  // Método para mover la persona
  moverse(direction) {
    const speed = 5;
    let velocity = { x: 0, y: 0 };
    switch(direction) {
      case 'movingUp':
      case 'up': velocity.y = -speed; break;
      case 'movingDown':
      case 'down': velocity.y = speed; break;
      case 'movingLeft':
      case 'left': velocity.x = -speed; break;
      case 'movingRight':
      case 'right': velocity.x = speed; break;
    }
    Matter.Body.setVelocity(this.body, velocity);
  }
  // Método para retroceder (se llamará en el evento de colisión)
  retroceder(direction) {
    if (!this.body) return;
    const velocidadRetroceso = 5;
    switch (direction) {
      case 'left':
        Matter.Body.setVelocity(this.body, { x: velocidadRetroceso, y: 0 }); // Retroceder a la derecha
        break;
      case 'right':
        Matter.Body.setVelocity(this.body, { x: -velocidadRetroceso, y: 0 }); // Retroceder a la izquierda
        break;
      case 'up':
        Matter.Body.setVelocity(this.body, { x: 0, y: velocidadRetroceso }); // Retroceder hacia abajo
        break;
      case 'down':
        Matter.Body.setVelocity(this.body, { x: 0, y: -velocidadRetroceso }); // Retroceder hacia arriba
        break;
      default:
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 }); // Detener si no hay dirección
    }
  }
  cambiarAnimacion(cual) {
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    if (this.spritesAnimados[cual]) {
      this.spritesAnimados[cual].visible = true;
    }
  }
  cargarSpritesAnimados(textureData, escala) {
    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(textureData.animations[key]);
      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.1;
      this.spritesAnimados[key].scale.set(escala);
      this.spritesAnimados[key].anchor.set(0.5, 1);
      this.container.addChild(this.spritesAnimados[key]);
    }
  }
  cambiarVelocidadDeAnimacionSegunVelocidadLineal() {
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
      this.spritesAnimados[key].animationSpeed = this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;
    }
  }
  moverseUnaVezLlegadoAlObjetivo() {
    const chanceDeCambiarAntesDeLlegar = Math.random() < 0.01
    if (calcularDistancia(this.posicion, this.target.posicion) < 100 || chanceDeCambiarAntesDeLlegar) {
      this.asignarTarget({ posicion: { x: Math.random() * this.juego.width, y: Math.random() * this.juego.height } });
      // console.log("El Ciudadano llego al Target")
    }
  }
  meEstoyChocandoContraLaParedIzquierda() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 510, 450, 100, 1080) ||
    intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 2410, 450, 2000, 1080)
  }
  meEstoyChocandoContraLaParedDerecha() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 1400, 450, 1900, 1080) ||
    intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 3300, 450, 3800, 1080)
  }
  meEstoyChocandoContraLaParedArriba() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 510, 450, 1410, 450) ||
    intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 2410, 450, 3300, 450)
  }
  meEstoyChocandoContraLaParedAbajo() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 0, 1080, 100, 1080) ||
    intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 1900, 1080, 2010, 1080) || 
    intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 3800, 1080, 3840, 1080)
  }
  meEstoyChocandoConAlgunaPared() {
    return this.meEstoyChocandoContraLaParedIzquierda() || 
    this.meEstoyChocandoContraLaParedDerecha() ||
    this.meEstoyChocandoContraLaParedArriba() ||
    this.meEstoyChocandoContraLaParedAbajo();
  }
  noChocarConLaParedIzquierda() {
    if (this.body.position.x < 50) {
      Matter.Body.setPosition(this.body, { x: 50, y: this.body.position.y });
      if (this.body.velocity.x < 0) {
        Matter.Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
      }
    }
  }
  noChocarConLaParedDerecha() {
    if (this.body.position.x > this.juego.width - 50) {
      Matter.Body.setPosition(this.body, { x: this.juego.width - 50, y: this.body.position.y });
      if (this.body.velocity.x > 0) {
        Matter.Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
      }
    }
  }
  noChocarConLaParedArriba() {
    if (this.body.position.y < 50) {
      Matter.Body.setPosition(this.body, { x: this.body.position.x, y: 50 });
      if (this.body.velocity.y < 0) {
        Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
      }
    }
  }
  noChocarConLaParedAbajo() {
    if (this.body.position.y > this.juego.height - 50) {
      Matter.Body.setPosition(this.body, { x: this.body.position.x, y: this.juego.height - 50 });
      if (this.body.velocity.y > 0) {
        Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
      }
    }
  }
  noChocarConNingunaPared() {
    this.noChocarConLaParedIzquierda()
    this.noChocarConLaParedDerecha()
    this.noChocarConLaParedArriba()
    this.noChocarConLaParedAbajo()
  }
  retrocederSiChocoConAlgunaPared() {
    if (this.meEstoyChocandoConAlgunaPared()) {
      this.noChocarConNingunaPared();
      console.log(this.nombre, "retrocediendo por choque con pared")
    }
  }
  calcularAnguloYVelocidadLineal() {
    this.angulo = radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;
    this.velocidadLineal = calcularDistancia(this.velocidad, { x: 0, y: 0 });
  }
  verificarSiEstoyMuerto() {
    if (this.vida <= 0) {
      this.morir();
      return;
    }
    this.vida += 0.0001;
    if (this.vida > this.vidaMaxima) this.vida = this.vidaMaxima;
  }
  quitarmeDeLosArrays() {
    if (this.juego.personas) {
      this.juego.personas = this.juego.personas.filter((persona) => persona !== this);
    }
  }
  morir() {
    if (this.muerto) return;
    this.container.label = "persona muerta - " + this.id;
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(this.body, 0);
    Matter.Composite.remove(this.juego.engine.world, this.body);
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].stop();
      this.spritesAnimados[key].visible = false;
    }
    this.muerto = true;
    this.quitarmeDeLosArrays();
  }
  recibirDanio(danio, deQuien) {
    this.vida -= danio;
  }
  borrar() {
    this.juego.containerPrincipal.removeChild(this.container);
    this.quitarmeDeLosArrays();
    this.container.parent = null;
    this.container = null;
    this.sprite = null;
  }
  actualizarBodyDesdePosicion() {
    Matter.Body.setPosition(this.body, this.posicion);
    Matter.Body.setVelocity(this.body, this.velocidad);
  }
  render() {
    super.render();
    this.actualizarBodyDesdePosicion();
    this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
    this.verificarSiEstoyMuerto();
  }
}