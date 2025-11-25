class Asesino extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    // Configuración especial del protagonista
    this.vida = 10;
    this.vision = 100; // Visión ilimitada
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.container.label = "prota";
    juego.targetCamara = juego.protagonista;
    this.agregarEventListenersDelTeclado();
    this.body.frictionAir = 0.05;
    this.assassinFSM = createFSM('idle', {
      'idle': {
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde idle)') }
      },
      'movingUp': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde arriba)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'movingDown': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde abajo)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'movingLeft': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde izquierda)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'movingRight': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde derecha)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = -15; } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha"); this.spritesAnimados.caminarDerecha.scale.x = 15; } }
      },
      'shooting': {
        'stopShooting': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } }
      }
    });
  }
  actualizarMovimiento() {
    let direction = 'idle';
    if (this.keysPressed['ArrowUp'] || this.keysPressed['w']) {
      direction = 'movingUp';
    } else if (this.keysPressed['ArrowDown'] || this.keysPressed['s']) {
      direction = 'movingDown';
    } else if (this.keysPressed['ArrowLeft'] || this.keysPressed['a']) {
      direction = 'movingLeft';
    } else if (this.keysPressed['ArrowRight'] || this.keysPressed['d']) {
      direction = 'movingRight';
    }
    if (direction !== 'idle') {
      this.moverse(direction);
      try {
        if (direction === 'movingUp') {
          this.assassinFSM.dispatch('moveUp');
        } else if (direction === 'movingDown') {
          this.assassinFSM.dispatch('moveDown');
        } else if (direction === 'movingLeft') {
          this.assassinFSM.dispatch('moveLeft');
        } else if (direction === 'movingRight') {
          this.assassinFSM.dispatch('moveRight');
        }
      } catch (error) {
        console.warn('Error en FSM:', error.message);
      }
    } else {
      const currentState = this.assassinFSM.getCurrentState();
      if (currentState !== 'idle') {
        try {
          this.assassinFSM.dispatch('stop');
        } catch (error) {
          console.warn('Error en FSM stop:', error.message);
        }
      }
    }
  }
  tick() {
    this.actualizarMovimiento();
    this.posicion.x = this.body.position.x;
    this.posicion.y = this.body.position.y;
    this.velocidad.x = this.body.velocity.x;
    this.velocidad.y = this.body.velocity.y;
    this.noChocarConNingunaPared();
    this.calcularAnguloYVelocidadLineal();
  }

  morir() {
    super.morir();
    this.juego.finDelJuego();
  }

  render(){
    this.container.x = this.body.position.x;
    this.container.y = this.body.position.y;
    this.container.zIndex = this.body.position.y;
    this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
    this.verificarSiEstoyMuerto();
  }
}