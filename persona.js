class Persona extends GameObject {
  spritesAnimados = {}
  constructor(x, y, juego) {
    super(x, y, juego);
    this.container.label = "persona - " + this.id;
    this.noPuedoPegarPeroEstoyEnCombate = false;
    this.muerto = false;

    this.nombre = generateName();

    this.rateOfFire = 600; //medido en milisegundos
    this.ultimoGolpe = 0;

    this.coraje = Math.random();
    this.vision = Math.random() * 400 + 400;

    this.fuerzaDeAtaque = 0.05 + Math.random() * 0.05;
    this.radio = 7 + Math.random() * 3;
    this.rangoDeAtaque = this.radio * 3;

    this.factorPerseguir = 0.15;
    this.factorEscapar = 0.1;

    this.factorSeparacion = 0.5;
    this.factorCohesion = 0.2;
    this.factorAlineacion = 0.4;

    this.factorRepelerSuavementeObstaculos = 1;

    this.aceleracionMaxima = 0.2;
    this.velocidadMaxima = 3;
    this.crearCajitaDeMatterJS();
    this.aplicameFuerza();
    
    // this.crearSombra();
    // this.esperarAQueTengaSpriteCargado(() => {this.crearGloboDeDialogo(); this.crearFSMparaAnimacion();});
  }

  moverseUnaVezLlegadoAlObjetivo() {
    /*
      Con esto, los ciudadanos se mueven al azar por medio de un target, y con chanceDeCambiarAntesDeLlegar se calcula el porcentaje de cambiar de Target 
    */
    const chanceDeCambiarAntesDeLlegar = Math.random() < 0.01
    if (calcularDistancia(this.posicion, this.target.posicion) < 100 || chanceDeCambiarAntesDeLlegar) {
      this.asignarTarget({ posicion: { x: Math.random() * this.juego.width, y: Math.random() * this.juego.height } });
      // console.log("El Ciudadano llego al Target")
    }
  }

  meEstoyChocandoContraLaParedIzquierda() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 510, 295, 100, 950)
  }

  meEstoyChocandoContraLaParedDerecha() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 1410, 295, 1800, 950)
  }

  meEstoyChocandoContraLaParedArriba() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 510, 295, 1410, 295)
  }

  meEstoyChocandoContraLaParedAbajo() {
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 100, 950, 1800, 950)
  }

  meEstoyChocandoConAlgunaPared() {
    return this.meEstoyChocandoContraLaParedIzquierda() || this.meEstoyChocandoContraLaParedDerecha() || this.meEstoyChocandoContraLaParedAbajo() || this.meEstoyChocandoContraLaParedArriba()
  }

  noChocarConLaParedIzquierda() {
    if (this.meEstoyChocandoContraLaParedIzquierda()) {
      this.velocidad.x = 100
      console.log(this.nombre, "choco con pared izquierda")
    }
  }

  noChocarConLaParedDerecha() {
    if (this.meEstoyChocandoContraLaParedDerecha()) {
      this.velocidad.y = 100
      console.log(this.nombre, "choco con pared derecha")
    }
  }

  noChocarConLaParedArriba() {
    if (this.meEstoyChocandoContraLaParedArriba()) {
      this.velocidad.y = 100
      console.log(this.nombre, "choco con pared arriba")
    }
  }

  noChocarConLaParedAbajo() {
    if (this.meEstoyChocandoContraLaParedAbajo()) {
      this.velocidad.y = -100
      console.log(this.nombre, "choco con pared abajo")
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
      
    }
  }

  aplicameFuerza(x, y) {
    Matter.Body.applyForce(this.cajita, { x: 0.5, y: 0.5 }, { x: x, y: y });
  }

  crearCajitaDeMatterJS() {
    this.cajita = Matter.Bodies.rectangle(
      this.posicion.x,
      this.posicion.y,
      this.ancho * 0.8,
      this.alto * 0.8,
      { restitution: 0.1, friction: 0.1, frictionAir: 0.01 }
    );
    this.cajita.angle = Math.random() * 3;
    Matter.Composite.add(this.juego.engine.world, [this.cajita]);
  }

  crearFSMparaAnimacion() {
    this.animationFSM = new FSM(this, {
      states: {
        idle: IdleAnimationState,
        walk: WalkAnimationState,
        run: RunAnimationState,
        pegar: PegarAnimationState,
        convertirse: ConvertirseAnimationState,
      },
      initialState: "idle",
    });
  }

  /*getPersonasCerca() {
    const cantDeCeldasQuePuedoVer = Math.ceil(
      this.vision / this.juego.grilla.anchoCelda
    );
    console.log("cantDeCeldasQuePuedoVer", cantDeCeldasQuePuedoVer, this.nombre, this.vision, this.juego.grilla.anchoCelda);
    
    const personasQueEstanEnMisCeldasVecinas = this.celdaActual.obtenerEntidadesAcaYEnCEldasVecinas(cantDeCeldasQuePuedoVer);

    return personasQueEstanEnMisCeldasVecinas.filter((persona) => calcularDistancia(this.posicion, persona.posicion) < this.vision && !persona.muerto);
  }*/

  getPersonasCerca() {
    return this.juego.personas.filter((persona) => calcularDistancia(this.posicion, persona.posicion) < this.vision && !persona.muerto);
  }

  buscarObstaculosBienCerquitaMio() {
    this.obstaculosCercaMio = [];
    this.obstaculosConLosQueMeEstoyChocando = [];
    const obstaculosCercasegunLaGrilla = this.celdaActual.obtenerEntidadesAcaYEnCEldasVecinas(1).filter((k) => this.juego.obstaculos.includes(k));

    for (let obstaculo of obstaculosCercasegunLaGrilla) {
      const dist = calcularDistancia(
        this.posicion,
        obstaculo.getPosicionCentral()
      );

      const distDeColision = this.radio + obstaculo.radio;
      const distConChangui = distDeColision + this.radio * 10;
      if (dist < distConChangui && dist > distDeColision) {
        this.obstaculosCercaMio.push(obstaculo);
      } else if (dist < distDeColision) {
        this.obstaculosConLosQueMeEstoyChocando.push(obstaculo);
      }
    }
  }

  repelerSuavementeObstaculos() {
    if (this.obstaculosCercaMio.length == 0) return;

    const posicionFutura = {
      x: this.posicion.x + this.velocidad.x * 10,
      y: this.posicion.y + this.velocidad.y * 10,
    };

    let fuerzaRepulsionTotal = { x: 0, y: 0 };

    for (let obstaculo of this.obstaculosCercaMio) {
      const posicionObstaculo = obstaculo.getPosicionCentral();

      // Vector que apunta del obstáculo hacia mi posición futura
      const vectorRepulsion = limitarVector({
        x: posicionFutura.x - posicionObstaculo.x,
        y: posicionFutura.y - posicionObstaculo.y,
      });
      const distancia = Math.sqrt(
        vectorRepulsion.x * vectorRepulsion.x +
        vectorRepulsion.y * vectorRepulsion.y
      );

      // Calcular fuerza inversamente proporcional a la distancia
      // Cuanto más cerca, más fuerza (usando 1/distancia)
      const fuerzaBase = 3; // Factor base de repulsión
      const distanciaMinima = 10; // Distancia mínima para evitar fuerzas extremas
      const fuerzaRepulsion = fuerzaBase / Math.max(distancia, distanciaMinima);

      // Aplicar la fuerza de repulsión
      fuerzaRepulsionTotal.x += vectorRepulsion.x * fuerzaRepulsion;
      fuerzaRepulsionTotal.y += vectorRepulsion.y * fuerzaRepulsion;
    }

    // Aplicar la fuerza total a la aceleración
    this.aceleracion.x += fuerzaRepulsionTotal.x * this.factorRepelerSuavementeObstaculos;
    this.aceleracion.y += fuerzaRepulsionTotal.y * this.factorRepelerSuavementeObstaculos;
  }

  percibirEntorno() {
    //todas las personas en mi rango de vision
    this.personasCerca = this.getPersonasCerca();
  }

  noChocarConObstaculos() {
    if (this.obstaculosConLosQueMeEstoyChocando.length == 0) return;
    const posicionFutura = {
      x: this.posicion.x + this.velocidad.x,
      y: this.posicion.y + this.velocidad.y,
    };

    for (let obstaculo of this.obstaculosConLosQueMeEstoyChocando) {
      const posicionObstaculo = obstaculo.getPosicionCentral();
      const vectorRepulsion = {
        x: posicionFutura.x - posicionObstaculo.x,
        y: posicionFutura.y - posicionObstaculo.y,
      };

      this.aceleracion.x += vectorRepulsion.x;
      this.aceleracion.y += vectorRepulsion.y;
    }
  }

  calcularAnguloYVelocidadLineal() {
    /**
     * CÁLCULO DE PARÁMETROS DE ANIMACIÓN
     *
     * Ángulo de movimiento:
     * - atan2(y,x) devuelve el ángulo en radianes del vector velocidad
     * - Se suma 180° para ajustar la orientación del sprite
     * - Conversión a grados para facilitar el trabajo con animaciones
     *
     * Velocidad lineal (magnitud del vector):
     * - |v| = √(vx² + vy²)
     * - Se calcula como distancia desde el origen (0,0)
     * - Usado para determinar qué animación reproducir (idle/walk/run)
     */
    this.angulo = radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;
    this.velocidadLineal = calcularDistancia(this.velocidad, { x: 0, y: 0 });
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



  /*cohesion() {
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
    
  separacion() {
    // const personasEnMiCeldaYAlrededores = this.celdaActual.obtenerEntidadesAcaYEnCEldasVecinas(1); //this.juego.personas;

    for (const persona of personasEnMiCeldaYAlrededores) {
      if (persona == this) continue;
      const distancia = calcularDistancia(this.posicion, persona.posicion);
      if (distancia > this.radio + persona.radio) continue;
      let vectorNuevo = {
        x: this.posicion.x - persona.posicion.x,
        y: this.posicion.y - persona.posicion.y,
      };

      this.aceleracion.x += vectorNuevo.x;
      this.aceleracion.y += vectorNuevo.y;
    }
  }*/

  verificarSiEstoyMuerto() {
    if (this.vida <= 0) {
      this.morir();
      return;
    }

    this.vida += 0.0001;
    if (this.vida > this.vidaMaxima) this.vida = this.vidaMaxima;
  }

  quitarSombra() {
    if (this.sombra) {
      this.container.removeChild(this.sombra);
      this.sombra.destroy();
      this.sombra = null;
    }
  }

  morir() {
    if (this.muerto) return;
    if (this.animationFSM) this.animationFSM.destroy();
    this.container.label = "persona muerta - " + this.id;
    this.quitarSombra();
    this.quitarBarritaVida();
    this.sprite.changeAnimation("hurt");
    this.sprite.loop = false;
    // Marcar como muerto PRIMERO para evitar que se actualice la barra durante el proceso
    this.muerto = true;

    // this.render();
    // Limpiar la barra de vida DESPUÉS de marcar como muerto

    this.borrarmeComoTargetDeTodos();
    this.quitarmeDeLosArrays();
  }

  quitarmeDeLosArrays() {
    // console.log("quitarmeDeLosArrays", this.id);
    this.juego.personas = this.juego.personas.filter(
      (persona) => persona !== this
    );
    this.juego.enemigos = this.juego.enemigos.filter(
      (persona) => persona !== this
    );
    this.juego.amigos = this.juego.amigos.filter((persona) => persona !== this);

    this.juego.policias = this.juego.policias.filter(
      (persona) => persona !== this
    );

    this.juego.civiles = this.juego.civiles.filter(
      (persona) => persona !== this
    );
  }

  recibirDanio(danio, deQuien) {
    this.vida -= danio;
    this.juego.particleSystem.hacerQueLeSalgaSangreAAlguien(this, deQuien);
  }

  caminarSinRumbo() {
    console.log("1")
    if (!this.container || !this.sprite) return;

    if (!this.targetRandom) {
      this.targetRandom = {
        posicion: {
          x: this.juego.anchoDelMapa * Math.random(),
          y: this.juego.altoDelMapa * Math.random(),
        },
      };
    }

    if (
      calcularDistancia(this.posicion, this.targetRandom.posicion) <
      this.distanciaParaLlegarALTarget
    ) {
      this.targetRandom = null;
    }

    if (!this.targetRandom) return;
    if (
      isNaN(this.targetRandom.posicion.x) ||
      isNaN(this.targetRandom.posicion.y)
    )
      debugger;

    // Vector de dirección hacia el objetivo
    const difX = this.targetRandom.posicion.x - this.posicion.x;
    const difY = this.targetRandom.posicion.y - this.posicion.y;

    const vectorNuevo = limitarVector({ x: difX, y: difY }, 1);

    // Aplicar fuerza de persecución escalada por el factor específico del objeto
    this.aceleracion.x += vectorNuevo.x * this.factorPerseguir;
    this.aceleracion.y += vectorNuevo.y * this.factorPerseguir;
  }

  render() {
    /**
     * RENDERIZADO CON ORDENAMIENTO EN PROFUNDIDAD
     *
     * 1. Verificaciones de seguridad
     * 2. Sincronización física-visual (super.render())
     * 3. Actualización del sistema de animación

     */
    super.render();
    this.cambiarDeSpriteAnimadoSegunAngulo()
  }

  borrar() {
    this.juego.containerPrincipal.removeChild(this.container);
    this.quitarBarritaVida();
    this.borrarmeComoTargetDeTodos();
    this.quitarmeDeLosArrays();
    this.container.parent = null;
    this.container = null;
    this.sprite = null;
    if (this.behaviorFSM) this.behaviorFSM.destroy();
    this.behaviorFSM = null;
    if (this.animationFSM) this.animationFSM.destroy();
    this.animationFSM = null;
  }
}