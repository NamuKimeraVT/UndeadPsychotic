const Z_INDEX = {
  containerPrincipal: 3,
  containerDebug: 10,
  containerUI: 100,
};

class Juego {
  pixiApp;
  personas = [];
  objetosInanimados = [];
  protagonista;
  score = 0;
  bestScore = 0;
  ahora = performance.now();

  constructor() {
    this.width = 3840;
    this.height = 2160;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 2;
    this.zoomStep = 0.1;
    this.camaraVelocidad = 1;
    this.mostrarCollidersDebug = true;
    this.initPIXI();
    this.initMatterJS();
  }

  initMatterJS() {
    // module aliases
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Events = Matter.Events;
    // create an engine
    this.engine = Engine.create();
    this.engine.world.gravity.y = 0;
    // Crear bordes de la pantalla
    this.piso = Bodies.rectangle(this.width / 2, this.height + 30, this.width, 60, { isStatic: true, friction: 1, });
    this.techo = Bodies.rectangle(this.width / 2, -30, this.width, 60, { isStatic: true, friction: 1, });
    this.paredIzquierda = Bodies.rectangle(-30, this.height / 2, 60, this.height, { isStatic: true, friction: 1, });
    this.paredDerecha = Bodies.rectangle(this.width + 30, this.height / 2, 60, this.height, { isStatic: true, friction: 1, });
    this.piso.label = "piso";
    this.techo.label = "techo";
    this.paredIzquierda.label = "paredIzquierda";
    this.paredDerecha.label = "paredDerecha";
    // add all of the bodies to the world
    Composite.add(this.engine.world, [this.piso, this.techo, this.paredIzquierda, this.paredDerecha]);
    // Detector de colisiones
    Events.on(this.engine, 'collisionStart', (event) => { this.manejarColisiones(event.pairs); });
    // run the renderer
    if (this.matterRenderer) Render.run(this.matterRenderer);
    // create runner
    this.matterRunner = Runner.create();
    // run the engine
    Runner.run(this.matterRunner, this.engine);
  }

  manejarColisiones(pairs) {
    for (let pair of pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;
      const objA = bodyA.gameObject;
      const objB = bodyB.gameObject;
      const personaA = objA instanceof Persona ? objA : null;
      const personaB = objB instanceof Persona ? objB : null;
      const objetoA = !personaA ? objA : null;
      const objetoB = !personaB ? objB : null;
      if (personaA && personaB) {
        if (personaA === this.protagonista && personaB instanceof Ciudadano) {
          console.log("Colisión detectada: Asesino colisiona con Ciudadano");
          personaB.recibirDanio(100, personaA);
          this.score += 100;
        } else if (personaB === this.protagonista && personaA instanceof Ciudadano) {
          console.log("Colisión detectada: Asesino colisiona con Ciudadano");
          personaA.recibirDanio(100, personaB);
          this.score += 100;
        }
        if (personaA instanceof Ciudadano && personaB === this.protagonista) {
          console.log("Colisión detectada: Ciudadano toca al Asesino");
          personaA.recibirDanio(100, personaB);
        } else if (personaB instanceof Ciudadano && personaA === this.protagonista) {
          console.log("Colisión detectada: Ciudadano toca al Asesino");
          personaB.recibirDanio(100, personaA);
        }
        if (personaA instanceof Policia && personaB === this.protagonista) {
          console.log("Colisión detectada: Policía toca al Asesino");
          personaB.recibirDanio(10, personaA);
        } else if (personaB instanceof Policia && personaA === this.protagonista) {
          console.log("Colisión detectada: Policía toca al Asesino");
          personaA.recibirDanio(10, personaB);
        }
        if (personaA instanceof Ciudadano && personaB instanceof Policia) {
          personaA.cambiarRuta();
          personaB.cambiarRuta();
        } else if (personaB instanceof Ciudadano && personaA instanceof Policia) {
          personaB.cambiarRuta();
          personaA.cambiarRuta();
        }
      }
      if (personaA && objetoB) {
        console.log("Colisión detectada: Persona colisiona con objeto inanimado");
        if (personaA instanceof Ciudadano || personaA instanceof Policia) {
          personaA.cambiarRuta();
        }
      }

      if (personaB && objetoA) {
        console.log("Colisión detectada: Persona colisiona con objeto inanimado");
        if (personaB instanceof Ciudadano || personaB instanceof Policia) {
          personaB.cambiarRuta();
        }
      }

      if (personaA && (bodyB.label === "piso" || bodyB.label === "techo" || bodyB.label === "paredIzquierda" || bodyB.label === "paredDerecha")) {
        console.log("Colisión detectada: Persona colisiona con pared -", bodyB.label);
        if (personaA instanceof Ciudadano || personaA instanceof Policia) {
          personaA.cambiarRuta();
        }
      }

      if (personaB && (bodyA.label === "piso" || bodyA.label === "techo" || bodyA.label === "paredIzquierda" || bodyA.label === "paredDerecha")) {
        console.log("Colisión detectada: Persona colisiona con pared -", bodyA.label);
        if (personaB instanceof Ciudadano || personaB instanceof Policia) {
          personaB.cambiarRuta();
        }
      }
    }
  }
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();
    globalThis.__PIXI_APP__ = this.pixiApp;
    const opcionesDePixi = {
      background: "#1099bb",
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      resolution: 1,
      resizeTo: window,
    };
    await this.pixiApp.init(opcionesDePixi);
    document.body.appendChild(this.pixiApp.canvas);
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    this.pixiApp.stage.sortableChildren = true;
    this.containerDebug = new PIXI.Container();
    this.containerDebug.label = "containerDebug";
    this.containerDebug.zIndex = Z_INDEX.containerDebug;
    this.pixiApp.stage.addChild(this.containerDebug);
    this.crearNivel();
    this.targetCamara = this.protagonista;
  }
  async crearNivel() {
    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.label = "containerPrincipal";
    this.containerPrincipal.zIndex = Z_INDEX.containerPrincipal;
    this.containerPrincipal.sortableChildren = true;
    this.containerPrincipal.position.set(0, 0);
    this.pixiApp.stage.addChild(this.containerPrincipal);
    this.crearFondo();
    this.crearLocales();
    this.crearFuentes();
    this.crearSillas();
    this.crearPalmeras();
    this.crearAsesino();
    this.crearCiudadanos(40);
    this.crearPolicias(10);
    this.ui = new UI(this);
  }
  async crearFondo() {
    this.fondo = new PIXI.Sprite(await PIXI.Assets.load("assets/piso2.png"));
    this.fondo.zIndex = -10;
    this.fondo.scale.set(1);
    this.fondo.width = this.width;
    this.fondo.height = this.height;
    this.containerPrincipal.addChild(this.fondo);
  }
  crearLocales() {
    this.crearLocal(960, 1080);
    this.crearLocal(2880, 1080);
  }
  crearLocal(x, y) {
    const local = new Local(x, y, this, 1);
    this.objetosInanimados.push(local);
  }
  crearPalmeras() {
    this.crearPalmera(700, 700)
    this.crearPalmera(1000, 1400)
    this.crearPalmera(3000, 800)
  }
  crearPalmera(x, y) {
    const palmera = new Palmera(x, y, this, 1, 1);
    this.objetosInanimados.push(palmera);
  }
  crearFuentes() {
    this.crearFuente(1400, 800);
    this.crearFuente(3070, 1420);
  }
  crearFuente(x, y) {
    const fuente = new Fuente(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(fuente);
  }
  crearSillas() {
    this.crearSilla(650, 1000)
    this.crearSilla(2650, 1500)
  }
  crearSilla(x, y) {
    const silla = new Silla(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(silla);
  }
  async crearAsesino() {
    const x = 900;
    const y = 500;
    const animacionesProtagonista = await PIXI.Assets.load("assets/personajes/img/asesino.json");
    const protagonista = new Asesino(animacionesProtagonista, x, y, this);
    this.personas.push(protagonista);
    this.protagonista = protagonista;
    this.targetCamara = protagonista;
  }
  async crearCiudadanos(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 1500 + Math.random() * 1000;
      const y = 1000 + Math.random() * 800;
      const animacionesCiudadano = await PIXI.Assets.load("assets/personajes/img/ciudadano.json");
      const civiles = new Ciudadano(animacionesCiudadano, x, y, this);
      this.personas.push(civiles);
    }
  }
  async crearPolicias(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 1500 + Math.random() * 1000;
      const y = 1000 + Math.random() * 800;
      const animacionesPolicia = await PIXI.Assets.load("assets/personajes/img/policia.json");
      const policia = new Policia(animacionesPolicia, x, y, this);
      this.personas.push(policia);
    }
  }
  guardarMejorPuntaje(puntaje) {
    if (puntaje > this.bestScore) {
      this.bestScore = puntaje;
      localStorage.setItem('bestScore', this.bestScore);
    }
  }
  cargarMejorPuntaje() {
    const puntajeGuardado = localStorage.getItem('bestScore');
    if (puntajeGuardado) {
      this.bestScore = parseInt(puntajeGuardado);
    }
  }
  finDelJuego() {
    if(this.protagonista.vida <= 0){
      alert("Te moriste! fin del juego. Tu puntaje final es: " + this.score);
      this.guardarMejorPuntaje(this.score);
    }
    const ciudadanosRestantes = this.personas.filter(p => p instanceof Ciudadano).length;
    if(ciudadanosRestantes === 0){
      alert("Ganaste! mataste a todos los ciudadanos. Tu puntaje final es: " + this.score);
      this.guardarMejorPuntaje(this.score);
    }
  }
  dibujarCollidersDebug() {
    this.containerDebug.removeChildren();
    const bodies = Matter.Composite.allBodies(this.engine.world);
    for (let body of bodies) {
      const graphics = new PIXI.Graphics();
      graphics.lineStyle(2, 0xFF0000, 0.8);
      graphics.beginFill(0xFFFFFF, 0.1);
      const vertices = body.vertices;
      if (vertices && vertices.length > 0) {
        graphics.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
          graphics.lineTo(vertices[i].x, vertices[i].y);
        }
        graphics.lineTo(vertices[0].x, vertices[0].y);
      }
      graphics.endFill();
      this.containerDebug.addChild(graphics);
    }
  }
  gameLoop(time) {
    for (let unpersona of this.personas) unpersona.tick();
    for (let unpersona of this.personas) unpersona.render();
    if (this.ui) this.ui.render();
    if (this.mostrarCollidersDebug) {
      this.dibujarCollidersDebug();
    }
    if (this.protagonista) {
      const offsetX = this.width / 4 - this.protagonista.posicion.x;
      const offsetY = this.height / 4 - this.protagonista.posicion.y;
      if (offsetX < 0 && offsetX > window.innerWidth - this.width) {
        this.containerPrincipal.x = offsetX;
        this.containerDebug.x = offsetX;
      }
      if (offsetY < 0 && offsetY > window.innerHeight - this.height) {
        this.containerPrincipal.y = offsetY;
        this.containerDebug.y = offsetY;
      }
    }
  }
}