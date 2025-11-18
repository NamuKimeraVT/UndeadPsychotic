class Policia extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    // console.log("La Ley fue insertada correctamente", textureData, x, y, juego)
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.factorPerseguir = 0.9;
    this.factorEscapar = 1 - this.coraje;
    this.distanciaParaLlegarALTarget = 500;

    this.factorRepelerSuavementeObstaculos = 0.66;
    this.aceleracionMaxima = 0.25;
    this.velocidadMaxima = 1;
    this.factorAlineacion = 0.33;
    this.asignarTarget(this.juego.mouse);
  }

  moverseUnaVezLlegadoAlObjetivo(){
    /*
      Con esto, los ciudadanos se mueven al azar por medio de un target, y con chanceDeCambiarAntesDeLlegar se calcula el porcentaje de cambiar de Target 
    */
    const chanceDeCambiarAntesDeLlegar = Math.random() < 0.01
    if(calcularDistancia(this.posicion, this.target.posicion) < 100 || chanceDeCambiarAntesDeLlegar){
      this.asignarTarget({posicion: {x: Math.random() * this.juego.width, y: Math.random() * this.juego.height}});
      console.log("El Policia llego al Target")
    }
  }

  estaElAsesinoEnMiAreaDeVision(){
    
  }

  perseguirAlAsesino(){
    /*
      Con esto, los ciudadanos se mueven al azar por medio de un target, y con chanceDeCambiarAntesDeLlegar se calcula el porcentaje de cambiar de Target 
    */
    const chanceDeCambiarAntesDeLlegar = Math.random() < 0.01
    if(calcularDistancia(this.posicion, this.target.posicion) < 10 || chanceDeCambiarAntesDeLlegar & this.estaElAsesinoEnMiAreaDeVision()){
      this.perseguir()
      console.log("El Ciudadano llego al Target")
    }
  }

  tick() {
    super.tick()
    this.moverseUnaVezLlegadoAlObjetivo()
    this.perseguirAlAsesino()
    this.noChocarConNingunaPared()
    /*if (this.muerto) return;
    this.verificarSiEstoyMuerto();

    this.percibirEntorno();
    this.caminarSinRumbo();
    this.cohesion();
    this.alineacion();
    this.separacion();

    this.perseguir();

    this.noChocarConObstaculos();
    this.repelerSuavementeObstaculos();
    // this.pegarSiEstaEnMiRango();

    this.calcularAnguloYVelocidadLineal();*/
  }
}