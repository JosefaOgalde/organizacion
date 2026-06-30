// Casco Sakura v2 — réplica imagen referencia
// Cúpula lisa · solapas aviador · arco frontal · óvalos lágrima · ranuras collar
// OpenSCAD → F6 → Export STL
$fn = 100;

wall = 2.5;
// semiejes exteriores (mm)
rx = 66; ry = 56; rz = 36;

module elip(aa, bb, cc) scale([aa, bb, cc]) sphere(1);

module cascara(aa, bb, cc) {
  difference() {
    elip(aa, bb, cc);
    elip(max(aa - wall, 1), max(bb - wall, 1), max(cc - wall, 1));
  }
}

module solapa(s) {
  difference() {
    hull() {
      translate([0, s * 52, -18]) cube([72, 26, 52], center = true);
      translate([0, s * 52, -42]) sphere(r = 14);
    }
    translate([0, s * 52, -16]) cube([72 - 2 * wall, 26 - 2 * wall, 48], center = true);
  }
}

module lagrima(s) {
  translate([6, s * 24, 26])
    rotate([0, 0, s * 14])
    rotate([72, 0, 0])
    scale([1, 0.72, 1.35])
      cylinder(h = 50, d = 30, center = true);
}

module ranura_collar(s) {
  translate([-6, s * 50, -36])
    rotate([90, 0, 0])
      hull() {
        translate([0, -11, 0]) cylinder(r = 3.2, h = 1, center = true);
        translate([0, 11, 0]) cylinder(r = 3.2, h = 1, center = true);
      }
}

module cuerpo() {
  union() {
    cascara(rx, ry, rz);
    solapa(-1);
    solapa(1);
    translate([-54, 0, 6]) cascara(19, 39, 20);
  }
}

module recortes() {
  // arco facial amplio
  translate([52, 0, 2]) scale([1.15, 1.25, 0.85]) sphere(r = 46);
  translate([46, 0, -14]) cube([50, 98, 58], center = true);
  // cuello
  translate([-8, 0, -50]) cube([112, 88, 38], center = true);
  // óvalos oreja
  lagrima(-1);
  lagrima(1);
  // collar
  ranura_collar(-1);
  ranura_collar(1);
}

difference() {
  cuerpo();
  recortes();
}
