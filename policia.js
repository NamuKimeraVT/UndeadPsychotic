class Policia extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.factorPerseguir = 0.9;
    this.distanciaParaLlegarALTarget = 500;
    this.areaDeVision = 200;
    this.velocidadMovimiento = 0.5;
    this.asignarTarget({ posicion: { x: Math.random() * this.juego.width, y: Math.random() * this.juego.height } });
    this.ancho = 10;
    this.alto = 25;
    this.persiguiendo = false;
    this.policiaFSM = createFSM('idle', {
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

  estaElAsesinoEnMiAreaDeVision(){
    if (!this.juego.protagonista) return false;
    const distancia = calcularDistancia(this.posicion, this.juego.protagonista.posicion);
    return distancia < this.areaDeVision;
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
    const speed = 3;
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
  cambiarRuta() {
    this.asignarTarget({ posicion: { x: Math.random() * this.juego.width, y: Math.random() * this.juego.height } });
  }

  actualizarMovimiento(){
    let direction = 'stop';
    
    if(this.estaElAsesinoEnMiAreaDeVision()){
      this.persiguiendo = true;
      this.asignarTarget(this.juego.protagonista);
    } else {
      this.persiguiendo = false;
    }
    
    if(this.persiguiendo){
      direction = this.calcularDireccionHaciaTarget();
      if(direction){
        this.moverse(direction);
      }
    } else {
      if(calcularDistancia(this.posicion, this.target.posicion) < 100){
        this.asignarTarget({ posicion: { x: Math.random() * this.juego.width, y: Math.random() * this.juego.height } });
      }
      direction = this.calcularDireccionHaciaTarget();
      if(direction){
        this.moverse(direction);
      }
    }
    
    const currentState = this.policiaFSM.getCurrentState();
    if (direction !== 'stop') {
      try {
        if (direction === 'movingUp') {
          this.policiaFSM.dispatch('moveUp');
        } else if (direction === 'movingDown') {
          this.policiaFSM.dispatch('moveDown');
        } else if (direction === 'movingLeft') {
          this.policiaFSM.dispatch('moveLeft');
        } else if (direction === 'movingRight') {
          this.policiaFSM.dispatch('moveRight');
        }
      } catch (error) {
        console.warn('Error en FSM:', error.message);
      }
    } else {
      if (currentState !== 'idle') {
        try {
          this.policiaFSM.dispatch('stop');
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