class Asesino extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    // Configuración especial del protagonista
    this.vida = 1;
    this.vision = 500; // Visión ilimitada
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.container.label = "prota";
    this.factorIrAlTarget = 0.5;
    this.distanciaParaEmpezarABajarLaVelocidad = this.radio * 20;
    this.distanciaAlTarget = Infinity;
    juego.targetCamara = this.protagonista;
    this.asignarTarget(this.juego.mouse);
    console.log("El Asesino fue insertado correctamente", textureData, x, y, juego)
  }

  tick() {
    super.tick()
    this.noChocarConNingunaPared()
  }
}