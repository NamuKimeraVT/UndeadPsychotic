class Juego {
  pixiApp;
  personas = [];
  objetosInanimados = [];
  width;
  height;

  constructor() {
    this.updateDimensions();
    this.anchoDelMapa = 1920;
    this.altoDelMapa = 1080;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();

    this.pixiApp.stage.name = "el stage";

    //esto es para que funcione la extension de pixi
    globalThis.__PIXI_APP__ = this.pixiApp;

    const opcionesDePixi = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
    };

    //inicializamos pixi con las opciones definidas anteriormente
    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado
    //puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi);

    // //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);
    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    this.agregarInteractividadDelMouse();
    this.pixiApp.stage.sortableChildren = true;
    this.crearNivel();
  }

  async crearNivel() {
    this.containerPrincipal = new PIXI.Container();
    this.pixiApp.stage.addChild(this.containerPrincipal);
    this.crearFondo();
    this.crearLocal();
    this.crearFuente();
    this.crearSillas();
    this.crearPalmera();
    this.crearAsesino();
    this.crearCiudadanos(40);
    this.crearPolicias(10);
  }

  async crearFondo() {
    this.fondo = new PIXI.TilingSprite(await PIXI.Assets.load("assets/piso2.png"));
    this.fondo.zIndex = -10;
    this.fondo.tileScale.set(1);
    this.fondo.width = this.anchoDelMapa;
    this.fondo.height = this.altoDelMapa;
    this.containerPrincipal.addChild(this.fondo);
  }

  crearLocal() {
    const x = 960;
    const y = 925;
    const local = new Local(x, y, this, 1);
    this.objetosInanimados.push(local);
  }

  crearPalmera() {
    const x = 800;
    const y = 725;
    const local = new Palmera(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(local);
  }

  crearFuente() {
    const x = 1600;
    const y = 800;
    const fuente = new Fuente(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(fuente);
  }

  crearSillas() {
    const x = 560;
    const y = 800;
    const silla = new Silla(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(silla);
  }

  async crearAsesino() {
    const x = 0.5 * this.width;
    const y = 0.5 * this.height;
    const animacionesProtagonista = await PIXI.Assets.load("assets/personajes/img/asesino.json");
    const protagonista = new Asesino(animacionesProtagonista, x, y, this);
    this.personas.push(protagonista);
  }

  async crearCiudadanos(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      const animacionesCiudadano = await PIXI.Assets.load("assets/personajes/img/ciudadano.json");
      const protagonista = new Ciudadano(animacionesCiudadano, x, y, this);
      this.personas.push(protagonista);
    }
  }

  async crearPolicias(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      const animacionesPolicia = await PIXI.Assets.load("assets/personajes/img/policia.json");
      const protagonista = new Policia(animacionesPolicia, x, y, this);
      this.personas.push(protagonista);
    }
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  getConejitoRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  asignarTargets() {
    for (let unaPersona of this.personas) {
      unaPersona.asignarTarget(this.getConejitoRandom());
    }
  }

  asignarElMouseComoTargetATodosLosConejitos() {
    for (let unaPersona of this.personas) {
      unaPersona.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let unaPersona of this.personas) {
      unaPersona.perseguidor = this.getConejitoRandom();
    }
  }

  asignarElMouseComoPerseguidorATodosLosConejitos() {
    for (let unaPersona of this.personas) {
      unaPersona.perseguidor = this.mouse;
    }
  }


  gameLoop(time) {
    //iteramos por todos los conejitos
    for (let unaPersona of this.personas) {
      //ejecutamos el metodo tick de cada conejito
      unaPersona.tick();
      unaPersona.render();
    }
  }
}