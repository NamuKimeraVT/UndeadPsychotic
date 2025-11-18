class Pared extends EntidadEstatca {
    constructor(juego, cx, cy, r, x1, y1, x2, y2) {
    this.juego = juego;
    this.radio = 20;
    this.sprite = null;
    intersectaLineaCirculo(cx, cy, r, x1, y1, x2, y2)
    this.render();
  }
}