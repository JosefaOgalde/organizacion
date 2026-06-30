// Casco Sakura — referencia imagen usuario
// Abrir en OpenSCAD → F6 → File → Export → STL
// Ejes: +X hocico | -X nuca | +Z arriba
$fn = 96;

// Medidas gatita (mm)
a = 60; b = 50; c = 30;       // semiejes cráneo
holgura = 3;
pared   = 2;
ear_sep = 30;
ear_w   = 32;
ear_h   = 48;

module elip(aa, bb, cc) scale([aa, bb, cc]) sphere(1);

module cascara() {
  difference() {
    elip(a + holgura + pared, b + holgura + pared, c + holgura + pared);
    elip(a + holgura, b + holgura, c + holgura);
  }
}

module casco_cuerpo() {
  union() {
    cascara();
    // solapas laterales (mejilla)
    for (s = [-1, 1])
      translate([5, s * 48, -12])
        hull() {
          cube([80, 20, 45], center = true);
          translate([0, 0, -22]) sphere(r = 10);
        }
    // extensión nuca
    translate([-52, 0, 8])
      cube([35, 72, 42], center = true);
  }
}

module recortes() {
  // apertura facial amplia (arco)
  translate([48, 0, -8]) cube([55, 94, 55], center = true);
  translate([36, 0, 24]) cube([38, 82, 28], center = true);
  // cuello abierto abajo
  translate([-5, 0, -48]) cube([108, 82, 35], center = true);
  // ranuras oreja (óvalos superiores)
  for (s = [-1, 1])
    translate([2, s * (ear_sep / 2 + 18), 28])
      rotate([90, 0, 0])
        scale([1, 1.15, 1])
          cylinder(h = ear_h, d = ear_w, center = true);
  // ranuras collar (pastilla vertical en solapas)
  for (s = [-1, 1])
    translate([-8, s * 46, -32])
      rotate([90, 0, 0])
        hull() {
          translate([0, -12, 0]) cylinder(r = 3.5, h = 1, center = true);
          translate([0, 12, 0]) cylinder(r = 3.5, h = 1, center = true);
        }
  // ventilación dorsal
  for (x = [-15, -28, -40])
    for (y = [-22, 0, 22])
      translate([x, y, 38]) rotate([90, 0, 0]) cylinder(h = 20, d = 5, center = true);
}

difference() {
  casco_cuerpo();
  recortes();
}
