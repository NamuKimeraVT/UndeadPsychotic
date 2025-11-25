const Z_INDEX = {
  containerPrincipal: 3,
  containerAsesino: 5,
};

class Juego {
  pixiApp;
  personas = [];
  objetosInanimados = [];
  protagonista;
  ahora = performance.now();

  constructor() {
    this.width = 3840;
    this.height = 2160;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 2;
    this.zoomStep = 0.1;
    this.camaraVelocidad = 0.1;
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
    this.piso = Bodies.rectangle(this.width / 2, this.height + 30, this.width, 60, { isStatic: true, friction: 1,});
    this.techo = Bodies.rectangle(this.width / 2, -30, this.width, 60, { isStatic: true, friction: 1,});
    this.paredIzquierda = Bodies.rectangle(-30, this.height / 2, 60, this.height, { isStatic: true, friction: 1,});
    this.paredDerecha = Bodies.rectangle(this.width + 30, this.height / 2, 60, this.height, { isStatic: true, friction: 1,});
    // add all of the bodies to the world
    Composite.add(this.engine.world, [this.piso, this.techo, this.paredIzquierda, this.paredDerecha]);
    // Detector de colisiones
    Events.on(this.engine, 'collisionStart', (event) => {this.manejarColisiones(event.pairs);});
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
      
      const personaA = this.personas.find(p => p.body === bodyA);
      const personaB = this.personas.find(p => p.body === bodyB);
      
      if (personaA && personaB) {
        if (personaA === this.protagonista && personaB instanceof Ciudadano) {
          console.log("Colisión detectada: Asesino colisiona con Ciudadano");
          personaB.recibirDanio(100, personaA);
        } else if (personaB === this.protagonista && personaA instanceof Ciudadano) {
          console.log("Colisión detectada: Asesino colisiona con Ciudadano");
          personaA.recibirDanio(100, personaB);
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
      }
    }
  }
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();
    globalThis.__PIXI_APP__ = this.pixiApp;
    const opcionesDePixi = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
      antialias: true,
      resolution: 1,
    };
    await this.pixiApp.init(opcionesDePixi);
    document.body.appendChild(this.pixiApp.canvas);
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    this.agregarInteractividadDelMouse();
    this.pixiApp.stage.sortableChildren = true;
    this.containerAsesino = new PIXI.Container();
    this.containerAsesino.label = "containerAsesino";
    this.containerAsesino.zIndex = Z_INDEX.containerAsesino;
    this.containerAsesino.position.set(0, 0);
    this.pixiApp.stage.addChild(this.containerAsesino);
    this.crearNivel();
    this.targetCamara = this.protagonista;
  }
  async crearNivel() {
    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.label = "containerPrincipal";
    this.containerPrincipal.zIndex = Z_INDEX.containerPrincipal;
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
  }
  async crearFondo() {
    this.fondo = new PIXI.Sprite(await PIXI.Assets.load("assets/piso2.png"));
    this.fondo.zIndex = -10;
    this.fondo.scale.set(1);
    this.fondo.width = this.width;
    this.fondo.height = this.height;
    this.containerPrincipal.addChild(this.fondo);
  }
  crearLocales(){
    this.crearLocal(1920, 1080);
    this.crearLocal(3840, 1080);
  }
  crearLocal(x, y) {
    const local = new Local(x, y, this, 1);
    this.objetosInanimados.push(local);
  }
  crearPalmeras() {
    this.crearPalmera(900, 700)
    this.crearPalmera(1000, 1400)
    this.crearPalmera(3000, 800)
  }
  crearPalmera(x, y){
    const palmera = new Palmera(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(palmera);
  }
  crearFuentes() {
    this.crearFuente(1400, 800);
    this.crearFuente(3070, 1420);
  }
  crearFuente(x, y){
    const fuente = new Fuente(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(fuente);
  }
  crearSillas() {
    this.crearSilla(650, 1000)
    this.crearSilla(2650, 1500)
  }
  crearSilla(x, y){
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
  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }
  hacerQLaCamaraSigaAlProtagonista() {
    if (!this.targetCamara) return;
    let targetX = -this.targetCamara.posicion.x * this.zoom + this.width / 2;
    let targetY = -this.targetCamara.posicion.y * this.zoom + this.height / 2;

    this.containerPrincipal.x = targetX;
    this.containerPrincipal.y = targetY;
  }
  finDelJuego() {
    alert("Te moriste! fin del juego");
  }

  gameLoop(time) {
    for (let unpersona of this.personas) unpersona.tick();
    for (let unpersona of this.personas) unpersona.render();
    if (this.protagonista) {
      const offsetX = this.width / 4.4 - this.protagonista.posicion.x;
      const offsetY = this.height / 4.4 - this.protagonista.posicion.y;
      this.containerPrincipal.x = offsetX;
      this.containerPrincipal.y = offsetY;
      this.containerAsesino.x = offsetX;
      this.containerAsesino.y = offsetY;
    }
  }
}