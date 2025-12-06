class UI {
    constructor(juego) {
        this.juego = juego;
        this.container = new PIXI.Container();
        this.container.label = "UIContainer";
        this.container.zIndex = 1000;
        this.juego.pixiApp.stage.addChild(this.container);

        this.vistaTexto = new PIXI.Text("", {
            fontSize: 28,
            fill: 0xFFFF00,
            fontFamily: "PixelifySans",
            fontWeight: "bold",
            stroke: 0x000000,
            strokeThickness: 3,
        });
        this.vistaTexto.position.set(20, 20);
        this.container.addChild(this.vistaTexto);
    }

    actualizar() {
        if (!this.juego.protagonista) return;

        const vida = this.juego.protagonista.vida;
        const ciudadanosRestantes = this.juego.personas.filter(p => p instanceof Ciudadano).length;
        const mejorPuntaje = this.juego.bestScore;
        const puntajeActual = this.juego.score;

        this.vistaTexto.text = `
Vida: ${vida}
Ciudadanos: ${ciudadanosRestantes}
Puntaje: ${puntajeActual}
Mejor: ${mejorPuntaje}
    `.trim();
    }

    render() {
        this.actualizar();
    }
}
