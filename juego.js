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
    // this.grilla = new Grilla(this, 150, this.anchoDelMapa, this.altoDelMapa);
    this.initPIXI();
    this.initMatterJS();
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
    this.piso = Bodies.rectangle(
      this.width / 2,
      this.height + 30,
      this.width,
      60,
      {
        isStatic: true,
        friction: 1,
      }
    );

    this.techo = Bodies.rectangle(this.width / 2, -30, this.width, 60, {
      isStatic: true,
      friction: 1,
    });

    this.paredIzquierda = Bodies.rectangle(
      -30,
      this.height / 2,
      60,
      this.height,
      {
        isStatic: true,
        friction: 1,
      }
    );

    this.paredDerecha = Bodies.rectangle(
      this.width + 30,
      this.height / 2,
      60,
      this.height,
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

  //async indica q este metodo es asyncronico, es decir q puede usar "await"
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

    // this.crearContainerBG();
    // this.crearGraficoDebug();

    // await this.cargarTexturas();
    this.crearFondo();

    this.crearFondo();
    this.crearLocal();
    this.crearFuente();
    this.crearSilla();
    this.crearPalmera();
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

  crearPalmera() {
    const x = 900;
    const y = 700;
    const local = new Palmera(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(local);
  }

  crearFuente() {
    const x = 1400;
    const y = 800;
    const fuente = new Fuente(x, y, this, 0.5, 0.5);
    this.objetosInanimados.push(fuente);
  }

  crearSilla() {
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
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      const animacionesCiudadano = await PIXI.Assets.load("assets/personajes/img/ciudadano.json");
      const civiles = new Ciudadano(animacionesCiudadano, x, y, this);
      this.personas.push(civiles);
      this.ciudadanos.push(civiles);
    }
  }

  async crearPolicias(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
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
  }

  moverContainerPrincipalA(x, y) {
    this.containerPrincipal.x = x;
    this.containerPrincipal.y = y;
    this.containerBG.x = x;
    this.containerBG.y = y;
  }

  cambiarZoom(zoom) {
    this.zoom = zoom;
    this.containerPrincipal.scale.set(this.zoom);
    this.containerBG.scale.set(this.zoom);
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

  chequearQueNoHayaMuertosConBarraDeVida() {
    this.containerPrincipal.children
      .filter((child) => child.label.startsWith("persona muerta"))
      .forEach((k) => {
        const containerBarraVida = k.children.find((k) =>
          k.label.startsWith("containerBarraVida")
        );

        const spriteAnimado = k.children.find((k) =>
          k.label.startsWith("animatedSprite")
        );

        //fade out muertos
        if (spriteAnimado) {
          spriteAnimado.alpha *= 0.996;
          spriteAnimado.alpha -= 0.0001;

          if (spriteAnimado.alpha < 0.01) {
            k.removeChild(spriteAnimado);
            spriteAnimado.destroy();
            this.containerPrincipal.removeChild(k);
          }
        }

        if (containerBarraVida) {
          k.removeChild(containerBarraVida);
          containerBarraVida.destroy();
        }
      });
  }

  gameLoop(time) {
    console.log("gameLoop", time, this.ahora);
    //borrar lo q hay en los graficos debug
    if (this.graficoDebug) this.graficoDebug.clear();

    for (let unpersona of this.personas) unpersona.tick();
    for (let unpersona of this.personas) unpersona.render();

    /*for (let arbol of this.arboles) arbol.tick();
    for (let farol of this.faroles) farol.tick();

    for (let obstaculo of this.obstaculos) obstaculo.render();

    // Actualizar el sistema de iluminación
    if (this.sistemaDeIluminacion) this.sistemaDeIluminacion.tick();
    if (this.particleSystem) this.particleSystem.update();*/
    if (this.ui) this.ui.tick();


    this.hacerQLaCamaraSigaAlProtagonista();
    this.calcularFPS();
    this.chequearQueNoHayaMuertosConBarraDeVida();

    if (!this.debug) return;
    // Dibujar las celdas de la grilla
    // Object.values(this.grilla.celdas).forEach((celda) => celda.dibujar());
    for (let obstaculo of this.obstaculos) obstaculo.dibujarCirculo();
    for (let unpersona of this.personas) unpersona.dibujarCirculo();
  }
}