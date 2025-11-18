class GameObject {
  //defino las propiedades q tiene mi clase, aunq podria no definirlas
  sprite;
  id;
  x = 0;
  y = 0;
  target;
  perseguidor;
  aceleracionMaxima = 0.2;
  velocidadMaxima = 3;
  spritesAnimados = {};
  radio = 10;
  distanciaPersonal = 20;
  distanciaParaLlegar = 300;

  constructor(x, y, juego) {
    this.container = new PIXI.Container();
    this.container.name = "container";
    this.vision = Math.random() * 200 + 1300;
    this.posicion = { x: x, y: y };
    this.velocidad = { x: Math.random() * 10, y: Math.random() * 10 };
    this.aceleracion = { x: 0, y: 0 };
    this.juego = juego;
    //generamos un ID para este conejito
    this.id = Math.floor(Math.random() * 99999999);
    this.juego.containerPrincipal.addChild(this.container);
  }

  cambiarAnimacion(cual) {
    //hacemos todos invisibles
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    //y despues hacemos visible el q queremos
    this.spritesAnimados[cual].visible = true;
  }
  cargarSpritesAnimados(textureData, escala) {
    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(textureData.animations[key]);
      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.1;
      this.spritesAnimados[key].scale.set(escala);
      this.spritesAnimados[key].anchor.set(1, 1);
      this.container.addChild(this.spritesAnimados[key]);
    }
  }
  cambiarDeSpriteAnimadoSegunAngulo() {
    //0 grados es a la izq, abre en sentido horario, por lo cual 180 es a la derecha
    //90 es para arriba
    //270 abajo
    if ((this.angulo > 315 && this.angulo < 360) || this.angulo < 45) {
      this.cambiarAnimacion("caminarDerecha");
      this.spritesAnimados.caminarDerecha.scale.x = -15;
    } else if (this.angulo > 135 && this.angulo < 225) {
      this.cambiarAnimacion("caminarDerecha");
      this.spritesAnimados.caminarDerecha.scale.x = 15;
    } else if (this.angulo < 135 && this.angulo > 45) {
      this.cambiarAnimacion("caminarArriba");
    } else {
      this.cambiarAnimacion("caminarAbajo");
    }
  }
  cambiarVelocidadDeAnimacionSegunVelocidadLineal() {
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
      this.spritesAnimados[key].animationSpeed = this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;
    }
  }

  separacion() {
    let promedioDePosicionDeAquellosQEstanMuyCercaMio = { x: 0, y: 0 };
    let contador = 0;
    for (let persona of this.juego.personas) {
      if (this != persona) {
        if (calcularDistancia(this.posicion, persona.posicion) < this.distanciaPersonal) {
          contador++;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.x += persona.posicion.x;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.y += persona.posicion.y;
        }
      }
    }
    if (contador == 0) return;
    promedioDePosicionDeAquellosQEstanMuyCercaMio.x /= contador;
    promedioDePosicionDeAquellosQEstanMuyCercaMio.y /= contador;
    let vectorQueSeAlejaDelPromedioDePosicion = {
      x: this.posicion.x - promedioDePosicionDeAquellosQEstanMuyCercaMio.x,
      y: this.posicion.y - promedioDePosicionDeAquellosQEstanMuyCercaMio.y,
    };
    vectorQueSeAlejaDelPromedioDePosicion = limitarVector(
      vectorQueSeAlejaDelPromedioDePosicion,
      1
    );
    const factor = 10;
    this.aceleracion.x += vectorQueSeAlejaDelPromedioDePosicion.x * factor;
    this.aceleracion.y += vectorQueSeAlejaDelPromedioDePosicion.y * factor;
  }

  /*
  cohesion() {
    let cont = 0;
    //verctor vacio donde vamos a ir sumando posiciones
    let vectorPromedioDePosiciones = { x: 0, y: 0 };
    //iteramos por todos los amigos
    for (const persona of this.amigosCerca) {
      if (persona === this || persona === this.juego.protagonista) continue;
      //si la persona ota no soy yo y no es el protagonista
      const distancia = calcularDistancia(this.posicion, persona.posicion);
      const sumaDeRadios = this.radio + persona.radio;
      const distanciaMinima = sumaDeRadios * 3;
      if (distancia < this.vision && distancia > distanciaMinima) {
        //si la persona esta muy cerca no nos acercamos a ella
        cont++;
        vectorPromedioDePosiciones.x += persona.posicion.x;
        vectorPromedioDePosiciones.y += persona.posicion.y;
      }
    }
    if (cont == 0) return;
    vectorPromedioDePosiciones.x /= cont;
    vectorPromedioDePosiciones.y /= cont;
    let vectorNuevo = limitarVector({
      x: vectorPromedioDePosiciones.x - this.posicion.x,
      y: vectorPromedioDePosiciones.y - this.posicion.y,
    });
    const distanciaAlPromedioDePosiciones = calcularDistancia(
      this.posicion,
      vectorPromedioDePosiciones
    );
    const distanciaMinima = this.radio * 14;
    if (distanciaAlPromedioDePosiciones < distanciaMinima) return;
    const factorDistancia = distanciaAlPromedioDePosiciones / distanciaMinima;
    vectorNuevo.x *= factorDistancia;
    vectorNuevo.y *= factorDistancia;
    this.aceleracion.x += this.factorCohesion * vectorNuevo.x;
    this.aceleracion.y += this.factorCohesion * vectorNuevo.y;
  }
  */
  rebotar() {
    //ejemplo mas realista
    if (this.posicion.x > this.juego.width || this.posicion.x < 0) {
      //si la coordenada X de este conejito es mayor al ancho del stage,
      //o si la coordenada X.. es menor q 0 (o sea q se fue por el lado izquierdo)
      //multiplicamos por -0.99, o sea que se invierte el signo (si era positivo se hace negativo y vicecversa)
      //y al ser 0.99 pierde 1% de velocidad
      this.velocidad.x *= -0.99;
    }
    if (this.posicion.y > this.juego.height || this.posicion.y < 0) {
      this.velocidad.y *= -0.99;
    }
  }
  perseguir() {
    if (!this.target) return;
    const dist = calcularDistancia(this.posicion, this.target.posicion);
    if (dist > this.vision) return;
    // Decaimiento exponencial: va de 1 a 0 a medida que se acerca
    let factor = Math.pow(dist / this.distanciaParaLlegar, 3);
    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;
    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);
    this.aceleracion.x += -vectorTemporal.x * factor;
    this.aceleracion.y += -vectorTemporal.y * factor;
  }

  escapar() {
    if (!this.perseguidor) return;
    const dist = calcularDistancia(this.posicion, this.perseguidor.posicion);
    if (dist > this.vision) return;
    const difX = this.perseguidor.posicion.x - this.posicion.x;
    const difY = this.perseguidor.posicion.y - this.posicion.y;
    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);
    this.aceleracion.x += -vectorTemporal.x;
    this.aceleracion.y += -vectorTemporal.y;
  }

  alineacion() {
    let cont = 0;
    let vectorPromedioDeVelocidades = { x: 0, y: 0 };
    for (const persona of this.amigosCerca) {
      if (persona !== this) {
        const distancia = calcularDistancia(this.posicion, persona.posicion);
        if (distancia < this.vision) {
          cont++;
          vectorPromedioDeVelocidades.x += persona.velocidad.x;
          vectorPromedioDeVelocidades.y += persona.velocidad.y;
        }
      }
    }
    if (cont == 0) return;
    vectorPromedioDeVelocidades.x /= cont;
    vectorPromedioDeVelocidades.y /= cont;
    let vectorNuevo = {
      x: vectorPromedioDeVelocidades.x - this.velocidad.x,
      y: vectorPromedioDeVelocidades.y - this.velocidad.y,
    };
    vectorNuevo = limitarVector(vectorNuevo, 1);
    this.aceleracion.x += this.factorAlineacion * vectorNuevo.x;
    this.aceleracion.y += this.factorAlineacion * vectorNuevo.y;
  }

  limitarAceleracion() {
    this.aceleracion = limitarVector(this.aceleracion, this.aceleracionMaxima);
  }
  limitarVelocidad() {
    this.velocidad = limitarVector(this.velocidad, this.velocidadMaxima);
  }
  aplicarFriccion() {
    const friccion = Math.pow(0.95, this.juego.pixiApp.ticker.deltaTime);
    this.velocidad.x *= friccion;
    this.velocidad.y *= friccion;
  }
  asignarTarget(quien) {
    this.target = quien;
  }
  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  tick() {
    //TODO: hablar de deltatime
    this.separacion();
    this.escapar();
    this.perseguir();
    this.limitarAceleracion();
    this.velocidad.x += this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.y += this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;
    //variaciones de la velocidad
    this.rebotar();
    this.aplicarFriccion();
    this.limitarVelocidad();
    //pixeles por frame
    this.posicion.x += this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    this.posicion.y += this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;
    //guardamos el angulo
    this.angulo = radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;
    this.velocidadLineal = Math.sqrt(this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y);
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    this.container.zIndex = this.posicion.y;
  }
}