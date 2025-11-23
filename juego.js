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
  paredes = [];
  protagonista;
  width;
  height;
  debug = false;
  barrasDeVidaVisibles = true;
  teclado = {};
  ahora = performance.now();
  BASE_Z_INDEX = 50000;

  constructor() {
    this.updateDimensions();
    this.width = 3840;
    this.height = 2160;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 2;
    this.zoomStep = 0.1;
    this.initPIXI();
    this.initMatterJS();
  }

  initMatterJS() {
    // module aliases
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;
    // create an engine
    this.engine = Engine.create();
    // create a renderer
    // this.matterRenderer = Render.create({
    //   element: document.body,
    //   engine: this.engine,
    // });
    // create two boxes and a ground
    // var boxA = Bodies.rectangle(400, 200, 80, 80);
    // var boxB = Bodies.rectangle(450, 50, 80, 80);
    // Crear bordes de la pantalla
    this.piso = Bodies.rectangle(this.width / 2, this.height + 30, this.width, 60,
      {
        isStatic: true,
        friction: 1,
      }
    );
    this.techo = Bodies.rectangle(this.width / 2, -30, this.width, 60, {
      isStatic: true,
      friction: 1,
    });
    this.paredIzquierda = Bodies.rectangle(0, this.height / 2, 60, this.height, 
    {
      isStatic: true, 
      friction: 1,
    });
    this.paredDerecha = Bodies.rectangle(this.width + 30, this.height / 2, 60, this.height,
      {
        isStatic: true,
        friction: 1,
      }
    );
    // add all of the bodies to the world
    Composite.add(this.engine.world, [
      this.piso,
      this.techo,
      this.paredIzquierda,
      this.paredDerecha,
    ]);
    // run the renderer
    if (this.matterRenderer) Render.run(this.matterRenderer);
    // create runner
    this.matterRunner = Runner.create();
    // run the engine
    Runner.run(this.matterRunner, this.engine);
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
    this.crearParedes(0, 0, 3800, 2120);
    this.crearLocales();
    this.crearFuentes();
    this.crearSillas();
    this.crearPalmeras();
    this.crearAsesino();
    this.targetCamara = this.protagonista;
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
  crearParedes(x1, y1, x2, y2){
    const paredIzquierda = new Pared(this, x1, y1, x1, y2)
    const paredDerecha = new Pared(this, x2, y1, x2, y2)
    const paredArriba = new Pared(this, x1, y1, x2, y1)
    const paredAbajo = new Pared(this, x1, y2, x2, y2)
    this.paredes.push(paredIzquierda);
    this.paredes.push(paredDerecha);
    this.paredes.push(paredArriba);
    this.paredes.push(paredAbajo);
  }
  crearParedesDeLosLocales(){

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
    this.crearSilla(650, 600)
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
  
  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }
  asignarElMouseComoTargetATodosLosConejitos() {
    for (let unaPersona of this.personas) {
      unaPersona.asignarTarget(this.mouse);
    }
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