class Asesino extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    this.keysPressed = [];
    // Configuración especial del protagonista
    this.vida = 10;
    this.vision = 100; // Visión ilimitada
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.container.label = "prota";
    this.factorIrAlTarget = 0.5;
    this.distanciaAlTarget = Infinity;
    juego.targetCamara = this.protagonista;
    // this.asignarTarget(this.juego.mouse);
    this.registerEventListeners()
    this.assassinFSM = createFSM('idle', {
      'idle': {
        'moveUp': { target: 'movingUp', action: () => { this.cambiarAnimacion("caminarArriba") } },
        'moveDown': { target: 'movingDown', action: () => { this.cambiarAnimacion("caminarAbajo") } },
        'moveLeft': { target: 'movingLeft', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'moveRight': { target: 'movingRight', action: () => { this.cambiarAnimacion("caminarDerecha") } },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde idle)') }
      },
      'movingUp': {
        'stop': { target: 'idle', action: () => console.log('Asesino se detiene (arriba)') },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde arriba)') },
        'moveDown': { target: 'movingDown', action: () => console.log('Asesino cambiando de dirección hacia abajo') },
        'moveLeft': { target: 'movingLeft', action: () => console.log('Asesino cambiando de dirección hacia la izquierda') },
        'moveRight': { target: 'movingRight', action: () => console.log('Asesino cambiando de dirección hacia la derecha') }
      },
      'movingDown': {
        'stop': { target: 'idle', action: () => console.log('Asesino se detiene (abajo)') },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde abajo)') },
        'moveUp': { target: 'movingUp', action: () => console.log('Asesino cambiando de dirección hacia arriba') },
        'moveLeft': { target: 'movingLeft', action: () => console.log('Asesino cambiando de dirección hacia la izquierda') },
        'moveRight': { target: 'movingRight', action: () => console.log('Asesino cambiando de dirección hacia la derecha') }
      },
      'movingLeft': {
        'stop': { target: 'idle', action: () => console.log('Asesino se detiene (izquierda)') },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde izquierda)') },
        'moveUp': { target: 'movingUp', action: () => console.log('Asesino cambiando de dirección hacia arriba') },
        'moveDown': { target: 'movingDown', action: () => console.log('Asesino cambiando de dirección hacia abajo') },
        'moveRight': { target: 'movingRight', action: () => console.log('Asesino cambiando de dirección hacia la derecha') }
      },
      'movingRight': {
        'stop': { target: 'idle', action: () => console.log('Asesino se detiene (derecha)') },
        'shoot': { target: 'shooting', action: () => console.log('Asesino disparando (desde derecha)') },
        'moveUp': { target: 'movingUp', action: () => console.log('Asesino cambiando de dirección hacia arriba') },
        'moveDown': { target: 'movingDown', action: () => console.log('Asesino cambiando de dirección hacia abajo') },
        'moveLeft': { target: 'movingLeft', action: () => console.log('Asesino cambiando de dirección hacia la izquierda') }
      },
      'shooting': {
        'stopShooting': { target: 'idle', action: () => console.log('Asesino deja de disparar') }
      }
    });
    console.log("El Asesino fue insertado correctamente", textureData, x, y, juego)
  }

  registerEventListeners() {
    document.addEventListener('keydown', (event) => { this.keysPressed[event.key] = true; });
    document.addEventListener('keyup', (event) => { this.keysPressed[event.key] = false; });
  }

  updateMovement() {
    let direction = '';
    if (this.keysPressed['ArrowUp'] || this.keysPressed['w']) {
      direction = 'up';
      this.cambiarAnimacion("caminarArriba");
      console.log('Asesino moviéndose hacia arriba');
      console.log("El movimiento arriba se actualizo");
    } else if (this.keysPressed['ArrowDown'] || this.keysPressed['s']) {
      direction = 'down';
      this.cambiarAnimacion("caminarAbajo");
      console.log('Asesino moviéndose hacia abajo')
      console.log("El movimiento abajo se actualizo")
    } else if (this.keysPressed['ArrowLeft'] || this.keysPressed['a']) {
      direction = 'left';
      this.cambiarAnimacion("caminarDerecha");
      console.log('Asesino moviéndose hacia la izquierda')
      console.log("El movimiento izquierda se actualizo")
    } else if (this.keysPressed['ArrowRight'] || this.keysPressed['d']) {
      direction = 'right';
      this.cambiarAnimacion("caminarDerecha");
      console.log('Asesino moviéndose hacia la derecha')
      console.log("El movimiento derecha se actualizo")
    }
    if (direction) {
      this.move(direction);
      // Actualiza el estado de la FSM
      if (direction === 'up') {
        this.assassinFSM.dispatch('moveUp');
      } else if (direction === 'down') {
        this.assassinFSM.dispatch('moveDown');
      } else if (direction === 'left') {
        this.assassinFSM.dispatch('moveLeft');
      } else if (direction === 'right') {
        this.assassinFSM.dispatch('moveRight');
      }
    } else {
      // Si no se presiona ninguna tecla, se detiene
      this.stop();
      this.assassinFSM.dispatch('stop'); // Cambia el estado a 'idle'
    }
  }
  // Método para detener el movimiento
  stop() {
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
  }

  setAssassinDirection(direction) {
    // Actualizar la dirección interna del asesino
    assassinFSM.dispatch(`move${direction.charAt(0).toUpperCase() + direction.slice(1)}`); // Ej: moveUp, moveDown, etc.
    // Aplicar velocidad correspondiente en Matter.js
    const speed = 5; // Ajusta la velocidad según sea necesario
    switch (direction) {
      case 'up':
        assassinBody.velocity.y = -speed; // Mover hacia arriba
        break;
      case 'down':
        assassinBody.velocity.y = speed; // Mover hacia abajo
        break;
      case 'left':
        assassinBody.velocity.x = -speed; // Mover hacia la izquierda
        break;
      case 'right':
        assassinBody.velocity.x = speed; // Mover hacia la derecha
        break;
      default:
        console.warn('Dirección inválida:', direction);
    }
    // Cambiar animación del sprite
    if (assassinSprite) {
      assassinSprite.gotoAndPlay(`walk${direction.charAt(0).toUpperCase() + direction.slice(1)}`); // Cambia la animación del sprite
    }
  }

  shoot(direction) {
    // Crear proyectil en Matter.js y PixiJS
    const projectile = Matter.Bodies.circle(assassinBody.position.x, assassinBody.position.y, 5, {
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
    assassinFSM.dispatch('shoot'); // Cambiar el estado a 'shooting'
    // Opcional: Puedes agregar lógica para manejar el fin del disparo después de un breve tiempo
    setTimeout(() => {
      assassinFSM.dispatch('stopShooting'); // Regresar al estado idle después de disparar
    }, 500); // El tiempo puede ser ajustado según la duración del disparo
  }

  tick() {
    super.tick()
    this.noChocarConNingunaPared()
    this.updateMovement(); // Actualiza el movimiento y la FSM
    // ... (resto del código de renderizado y actualización del motor)
    //Matter.Engine.update(engine);
  }
}