class Ciudadano extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    // console.log("Los Ciudadanos fueron insertados correctamente", textureData, x, y, juego)
    this.asignarTarget({posicion: {x: Math.random() * this.juego.width, y: Math.random() * this.juego.height}}); // Al usar el ancho y alto del juego los ciudadanos se mueven al azar
  }

  moverseUnaVezLlegadoAlObjetivo(){
    /*
      Con esto, los ciudadanos se mueven al azar por medio de un target, y con chanceDeCambiarAntesDeLlegar se calcula el porcentaje de cambiar de Target 
    */
    const chanceDeCambiarAntesDeLlegar = Math.random() < 0.01
    if(calcularDistancia(this.posicion, this.target.posicion) < 100 || chanceDeCambiarAntesDeLlegar){
      this.asignarTarget({posicion: {x: Math.random() * this.juego.width, y: Math.random() * this.juego.height}});
      // console.log("El Ciudadano llego al Target")
    }
  }

  meEstoyChocandoContraLaParedIzquierda(){
    return intersectaLineaCirculo(this.posicion.x, this.posicion.y, 50, 509, 295, 100, 900)
  }
  
  tick() {
    super.tick()
    if(this.meEstoyChocandoContraLaParedIzquierda()){
      this.velocidad.x = 100
      console.log(this.nombre, "choco con pared")
    }
    this.moverseUnaVezLlegadoAlObjetivo()

    this.aceleracion.x = 0;
    this.aceleracion.y = 0;
  }
}