// Casco Sakura v3 — UNA pieza continua (tal cual imagen)
// Sin piezas añadidas. Solo hull + recortes.
$fn = 120;
wall = 2.5;
k = (64 - wall) / 64;

module elip(a, b, c) scale([a, b, c]) sphere(1);

module cuerpo(s) {
  union() {
    translate([0, 0, 8 * s]) elip(64 * s, 54 * s, 34 * s);
    for (ys = [-1, 1])
      translate([2 * s, ys * 44 * s, -26 * s]) elip(26 * s, 24 * s, 30 * s);
  }
}

module cascara() {
  difference() {
    cuerpo(1);
    cuerpo(k);
  }
}

module lagrima(s) {
  translate([18, s * 22, 22])
    rotate([0, 0, s * 16])
    rotate([58, 0, 0])
    scale([1, 0.68, 1.3])
      cylinder(h = 46, d = 28, center = true);
}

module ranura(s) {
  translate([0, s * 44, -34])
    rotate([90, 0, 0])
      hull() {
        translate([0, -10, 0]) cylinder(r = 3, h = 1, center = true);
        translate([0, 10, 0]) cylinder(r = 3, h = 1, center = true);
      }
}

difference() {
  cascara();
  translate([48, 0, 0]) scale([1.1, 1.2, 0.8]) sphere(r = 44);
  translate([44, 0, -16]) cube([42, 96, 52], center = true);
  translate([-6, 0, -48]) cube([100, 86, 36], center = true);
  lagrima(-1);
  lagrima(1);
  ranura(-1);
  ranura(1);
}
