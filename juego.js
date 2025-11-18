const Z_INDEX = {
  containerBG: 0,
  graficoSombrasProyectadas: 1,
  containerIluminacion: 2,
  containerPrincipal: 3,
  spriteAmarilloParaElAtardecer: 4,
  containerUI: 5,
};

class Juego {
  pixiApp;
  personas = [];
  ciudadanos = [];
  policias = [];
  objetosInanimados = [];
  protagonista;
  width;
  height;
  debug = false;
  barrasDeVidaVisibles = true;
  distanciaALaQueLosObjetosTienenTodaLaLuz = 157;
  factorMagicoArriba = 2;
  factorMagicoAbajo = 2.18;
  teclado = {};
  ahora = performance.now();
  BASE_Z_INDEX = 50000;

  constructor() {
    this.updateDimensions();
    this.anchoDelMapa = 3840;
    this.altoDelMapa = 2160;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 2;
    this.zoomStep = 0.1;
    this.initPIXI();
    this.setupResizeHandler();
  }

  setupResizeHandler() {
    window.addEventListener("resize", () => {
      this.updateDimensions();
      if (this.pixiApp) {
        this.pixiApp.renderer.resize(this.width, this.height);
      }
      // Redimensionar la RenderTexture del sistema de iluminación
      if (this.sistemaDeIluminacion) {
        this.sistemaDeIluminacion.redimensionarRenderTexture();
      }
      if (this.ui) this.ui.resize();
    });
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
      resizeTo: window,
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
    this.agregarListenersDeTeclado();
    this.agregarInteractividadDelMouse();
    this.pixiApp.stage.sortableChildren = true;
    this.crearNivel();
    this.ui = new UI(this);
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  async crearNivel() {
    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.label = "containerPrincipal";
    this.containerPrincipal.zIndex = Z_INDEX.containerPrincipal;
    this.pixiApp.stage.addChild(this.containerPrincipal);
    this.crearFondo();
    this.crearLocal();
    this.crearFuentes();
    this.crearSillas();
    this.crearPalmeras();
    this.crearAsesino();
    this.targetCamara = this.protagonista;
    this.crearCiudadanos(20);
    this.crearPolicias(10);
    // this.crearCruzTarget();
    // Crear el sistema de iluminación
    // this.sistemaDeIluminacion = new SistemaDeIluminacion(this);
    // this.particleSystem = new ParticleSystem(this);
  }

  async crearFondo() {
    this.fondo = new PIXI.Sprite(await PIXI.Assets.load("assets/piso2.png"));
    this.fondo.zIndex = -10;
    this.fondo.scale.set(1);
    this.fondo.width = this.anchoDelMapa;
    this.fondo.height = this.altoDelMapa;
    this.containerPrincipal.addChild(this.fondo);
  }

  crearLocal() {
    const x = 1920;
    const y = 1080;
    const local = new Local(x, y, this, 1);
    this.objetosInanimados.push(local);
  }

  crearPalmeras() {
    this.crearPalmera1()
    this.crearPalmera2()
  }

  crearPalmera1(){
    const x = 900;
    const y = 700;
    const palmera = new Palmera(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(palmera);
  }

  crearPalmera2(){
    const x = 1000;
    const y = 1400;
    const palmera = new Palmera(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(palmera);
  }

  crearFuentes() {
    this.crearFuente1();
    this.crearFuente2();
  }

  crearFuente1(){
    const x = 3070;
    const y = 1420;
    const fuente1 = new Fuente(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(fuente1);
  }

  crearFuente2(){
    const x = 1400;
    const y = 800;
    const fuente2 = new Fuente(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(fuente2);
  }

  crearSillas() {
    this.crearSilla1()
  }

  crearSilla1(){
    const x = 650;
    const y = 600;
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
  }

  async crearCiudadanos(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 2400;
      const y = 1600;
      const animacionesCiudadano = await PIXI.Assets.load("assets/personajes/img/ciudadano.json");
      const civiles = new Ciudadano(animacionesCiudadano, x, y, this);
      this.personas.push(civiles);
      this.ciudadanos.push(civiles);
    }
  }

  async crearPolicias(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 2550;
      const y = 1500;
      const animacionesPolicia = await PIXI.Assets.load("assets/personajes/img/policia.json");
      const policia = new Policia(animacionesPolicia, x, y, this);
      this.personas.push(policia);
      this.policias.push(policia);
    }
  }

  agregarListenersDeTeclado() {
    window.onkeydown = (event) => {
      this.teclado[event.key.toLowerCase()] = true;
      if (event.key == "1") {
        this.crearUnAmigo(this.mouse.posicion.x, this.mouse.posicion.y);
      } else if (parseInt(event.key)) {
        this.crearUnEnemigo(
          parseInt(event.key),
          this.mouse.posicion.x,
          this.mouse.posicion.y
        );
      }
    };
    window.onkeyup = (event) => {
      this.teclado[event.key.toLowerCase()] = false;
      if (event.key.toLowerCase() == "u") {
        this.hacerQLaCamaraSigaAAlguien();
      }
    };
  }

  getPersonaRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }
  asignarTargets() {
    for (let unaPersona of this.personas) {
      unaPersona.asignarTarget(this.getPersonaRandom());
    }
  }
  asignarElMouseComoTargetATodosLosConejitos() {
    for (let unaPersona of this.personas) {
      unaPersona.asignarTarget(this.mouse);
    }
  }
  asignarPerseguidorRandomATodos() {
    for (let unaPersona of this.personas) {
      unaPersona.perseguidor = this.getPersonaRandom();
    }
  }
  asignarElMouseComoPerseguidorATodosLosConejitos() {
    for (let unaPersona of this.personas) {
      unaPersona.perseguidor = this.mouse;
    }
  }

  hacerQLaCamaraSigaAAlguien() {
    if (!this.targetCamara) return;
    // Ajustar la posición considerando el zoom actual
    let targetX = -this.targetCamara.posicion.x * this.zoom + this.width / 2;
    let targetY = -this.targetCamara.posicion.y * this.zoom + this.height / 2;
    const x = (targetX - this.containerPrincipal.x) * 0.1;
    const y = (targetY - this.containerPrincipal.y) * 0.1;
    this.moverContainerPrincipalA(
      this.containerPrincipal.x + x,
      this.containerPrincipal.y + y
    );
  }

  hacerQLaCamaraSigaAlProtagonista() {
    if (!this.targetCamara) return;
    // Ajustar la posición considerando el zoom actual
    let targetX = -this.targetCamara.posicion.x * this.zoom + this.width / 2;
    let targetY = -this.targetCamara.posicion.y * this.zoom + this.height / 2;
    const x = (targetX - this.containerPrincipal.x) * 0.1;
    const y = (targetY - this.containerPrincipal.y) * 0.1;
    this.containerPrincipal.x += x;
    this.containerPrincipal.y += y;
    this.moverContainerPrincipalA(this.containerPrincipal.x + x, this.containerPrincipal.y + y);
    console.log("La camara funciona")
  }

  moverContainerPrincipalA(x, y) {
    this.containerPrincipal.x = x;
    this.containerPrincipal.y = y;
    //this.containerBG.x = x;
    //this.containerBG.y = y;
  }

  cambiarZoom(zoom) {
    this.zoom = zoom;
    this.containerPrincipal.scale.set(this.zoom);
    // this.containerBG.scale.set(this.zoom);
  }

  calcularFPS() {
    this.deltaTime = performance.now() - this.ahora;
    this.ahora = performance.now();
    this.fps = 1000 / this.deltaTime;
    this.ratioDeltaTime = this.deltaTime / 16.66;
  }

  toggleDebug() {
    this.debug = !this.debug;
  }

  finDelJuego() {
    alert("Te moriste! fin del juego");
  }

  gameLoop(time) {
    console.log("gameLoop", time, this.ahora);
    //borrar lo q hay en los graficos debug
    if (this.graficoDebug) this.graficoDebug.clear();
    for (let unpersona of this.personas) unpersona.tick();
    for (let unpersona of this.personas) unpersona.render();
    if (this.ui) this.ui.tick();
    this.hacerQLaCamaraSigaAlProtagonista();
    this.calcularFPS();
    if (!this.debug) return;
  }
}