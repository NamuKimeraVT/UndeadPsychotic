class Ciudadano extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.areaDeVisionDelAsesino = 300;
    this.asignarTarget({ posicion: { x: Math.random() * this.juego.width, y: Math.random() * this.juego.height } });
    this.huyendo = false;
    this.ciudadanoFSM = createFSM('idle', {
      'idle': {
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'movingUp': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'movingDown': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'movingLeft': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'movingRight': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      }
    });
  }

  puedeVerAlAsesino(){
    if (!this.juego.protagonista) return false;
    const distancia = calcularDistancia(this.posicion, this.juego.protagonista.posicion);
    return distancia < this.areaDeVisionDelAsesino;
  }

  calcularDireccionOpuestaAlAsesino(){
    if (!this.juego.protagonista) return null;
    const difX = this.juego.protagonista.posicion.x - this.posicion.x;
    const difY = this.juego.protagonista.posicion.y - this.posicion.y;
    const absDifX = Math.abs(difX);
    const absDifY = Math.abs(difY);
    if (absDifY > absDifX) {
      return difY > 0 ? 'movingUp' : 'movingDown';
    } else {
      return difX > 0 ? 'movingLeft' : 'movingRight';
    }
  }

  calcularDireccionHaciaTarget(){
    if (!this.target) return null;
    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;
    const absDifX = Math.abs(difX);
    const absDifY = Math.abs(difY);
    if (absDifY > absDifX) {
      return difY > 0 ? 'movingDown' : 'movingUp';
    } else {
      return difX > 0 ? 'movingRight' : 'movingLeft';
    }
  }

  moverse(direction) {
    const speed = 2;
    let velocity = { x: 0, y: 0 };
    switch(direction) {
      case 'movingUp':
      case 'up': velocity.y = -speed; break;
      case 'movingDown':
      case 'down': velocity.y = speed; break;
      case 'movingLeft':
      case 'left': velocity.x = -speed; break;
      case 'movingRight':
      case 'right': velocity.x = speed; break;
    }
    Matter.Body.setVelocity(this.body, velocity);
  }

  actualizarMovimiento(){
    let direction = 'stop';
    if(this.puedeVerAlAsesino()){
      this.huyendo = true;
      direction = this.calcularDireccionOpuestaAlAsesino();
      if(direction){
        this.moverse(direction);
      }
    } else {
      this.huyendo = false;
      if(calcularDistancia(this.posicion, this.target.posicion) < 100){
        this.asignarTarget({ posicion: { x: Math.random() * this.juego.width, y: Math.random() * this.juego.height } });
      }
      direction = this.calcularDireccionHaciaTarget();
      if(direction){
        this.moverse(direction);
      }
    }
    const currentState = this.ciudadanoFSM.getCurrentState();
    if (direction !== 'stop') {
      try {
        if (direction === 'movingUp') {
          this.ciudadanoFSM.dispatch('moveUp');
        } else if (direction === 'movingDown') {
          this.ciudadanoFSM.dispatch('moveDown');
        } else if (direction === 'movingLeft') {
          this.ciudadanoFSM.dispatch('moveLeft');
        } else if (direction === 'movingRight') {
          this.ciudadanoFSM.dispatch('moveRight');
        }
      } catch (error) {
        console.warn('Error en FSM:', error.message);
      }
    } else {
      if (currentState !== 'idle') {
        try {
          this.ciudadanoFSM.dispatch('stop');
        } catch (error) {
          console.warn('Error en FSM stop:', error.message);
        }
      }
    }
  }

  tick() {
    this.actualizarMovimiento()
    this.posicion.x = this.body.position.x;
    this.posicion.y = this.body.position.y;
    this.velocidad.x = this.body.velocity.x;
    this.velocidad.y = this.body.velocity.y;
    this.noChocarConNingunaPared()
    this.calcularAnguloYVelocidadLineal();
  }

  render(){
    this.container.x = this.body.position.x;
    this.container.y = this.body.position.y;
    this.container.zIndex = this.body.position.y;
    this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
    this.verificarSiEstoyMuerto();
  }
}