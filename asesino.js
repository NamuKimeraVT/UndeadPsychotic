class Asesino extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    // Configuración especial del protagonista
    this.vida = 10;
    this.vision = 100; // Visión ilimitada
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.container.label = "prota";
    this.factorIrAlTarget = 0.5;
    this.distanciaAlTarget = Infinity;
    juego.targetCamara = juego.protagonista;
    // this.asignarTarget(this.juego.mouse);
    this.agregarEventListenersDelTeclado();
    this.assassinFSM = createFSM('idle', {
      'idle': {
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde idle)') }
      },
      'movingUp': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde arriba)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha") } }
      },
      'movingDown': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde abajo)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha") } }
      },
      'movingLeft': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde izquierda)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha") } }
      },
      'movingRight': {
        'stop': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde derecha)') },
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha") } }
      },
      'shooting': {
        'stopShooting': { target: 'idle', action: () => { this.cambiarAnimacion("idleAbajo") } }
      }
    });
    console.log("El Asesino fue insertado correctamente", textureData, x, y, juego);
    this.ancho = 9;
    this.alto = 25;
    this.crearCajitaDeMatterJS();
  }

  crearCajitaDeMatterJS() {
    this.asesino = Matter.Bodies.rectangle(
      this.posicion.x,
      this.posicion.y,
      this.ancho * 0.8,
      this.alto * 0.8,
      { restitution: 0.1, friction: 0.1, frictionAir: 0.01 }
    );
    this.asesino.angle = Math.random() * 3;
    Matter.Composite.add(this.juego.engine.world, [this.asesino]);
  }

  updateMovement() {
    let direction = '';
    if (this.keysPressed['ArrowUp'] || this.keysPressed['w']) {
      direction = 'up';
      console.log('Asesino moviéndose hacia arriba');
      console.log("El movimiento se actualizo");
    } else if (this.keysPressed['ArrowDown'] || this.keysPressed['s']) {
      direction = 'down';
      console.log('Asesino moviéndose hacia abajo');
      console.log("El movimiento se actualizo");
    } else if (this.keysPressed['ArrowLeft'] || this.keysPressed['a']) {
      direction = 'left';
      console.log('Asesino moviéndose hacia la izquierda');
      console.log("El movimiento se actualizo");
    } else if (this.keysPressed['ArrowRight'] || this.keysPressed['d']) {
      direction = 'right';
      console.log('Asesino moviéndose hacia la derecha');
      console.log("El movimiento se actualizo");
    }
    
    if (direction) {
      this.move(direction);
      // Actualiza el estado de la FSM (la FSM manejará las animaciones)
      try {
        if (direction === 'up') {
          this.assassinFSM.dispatch('moveUp');
        } else if (direction === 'down') {
          this.assassinFSM.dispatch('moveDown');
        } else if (direction === 'left') {
          this.assassinFSM.dispatch('moveLeft');
        } else if (direction === 'right') {
          this.assassinFSM.dispatch('moveRight');
        }
      } catch (error) {
        // Si hay un error, probablemente ya estamos en ese estado
        console.warn('Error en FSM:', error.message);
      }
    } else {
      // Si no se presiona ninguna tecla, se detiene
      this.stop();
      // Solo hacer dispatch si no estamos ya en idle
      const currentState = this.assassinFSM.getCurrentState();
      if (currentState !== 'idle') {
        try {
          this.assassinFSM.dispatch('stop'); // Cambia el estado a 'idle' y la animación
        } catch (error) {
          console.warn('Error en FSM stop:', error.message);
        }
      }
    }
  }
  // Método para detener el movimiento
  stop() {
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
  }
  shoot(direction) {
    // Crear proyectil en Matter.js y PixiJS
    const projectile = Matter.Bodies.circle(this.body.position.x, this.body.position.y, 5, {
      restitution: 0.5 // Puedes ajustar la restitución para el comportamiento del proyectil
    });
    // Añadir el proyectil al mundo de Matter.js
    Matter.World.add(engine.world, projectile);
    // Aplicar velocidad al proyectil según la dirección
    const projectileSpeed = 10; // Ajusta la velocidad del proyectil según sea necesario
    switch (direction) {
      case 'up':
        Matter.Body.setVelocity(projectile, { x: 0, y: -projectileSpeed });
        break;
      case 'down':
        Matter.Body.setVelocity(projectile, { x: 0, y: projectileSpeed });
        break;
      case 'left':
        Matter.Body.setVelocity(projectile, { x: -projectileSpeed, y: 0 });
        break;
      case 'right':
        Matter.Body.setVelocity(projectile, { x: projectileSpeed, y: 0 });
        break;
      default:
        console.warn('Dirección inválida para disparar:', direction);
    }
    // Transicionar a 'shooting' o manejar el fin del disparo
    this.assassinFSM.dispatch('shoot');
    // Opcional: Puedes agregar lógica para manejar el fin del disparo después de un breve tiempo
    setTimeout(() => {
      this.assassinFSM.dispatch('stopShooting');
    }, 500); // El tiempo puede ser ajustado según la duración del disparo
  }

  tick() {
    super.tick()
    this.noChocarConNingunaPared()
    this.updateMovement(); // Actualiza el movimiento y la FSM
    //Matter.Engine.update(engine);
  }

  render(){
    super.render()
  }
}