// @sakura-casco  Fase 2.1 - maestro parametrico (falda+anillo, flancos recortados)
// Ejes: +x rostral (hocico) | -x caudal (nuca) | +z dorsal
$fn = 96;

/* ===================== PARAMETROS ===================== */
a = 60; b = 50; c = 30;
holgura   = 3;
pared_ac  = 2;
x_front   = 20;
x_rim     = -55;
x_ear     = -5;
ranura_l  = 80; ranura_w = 27;
ranura_sep= 30;
vent_d    = 5;
anillo_circ = 207;
pared_tpu = 1.5;
anillo_alto = 12;
flanco_lesion_y = 18;   // Fase 2.1: cobertura lateral max sobre lesion (+/- Y)
falda_largo = 25;       // Fase 2.1: falda caudal que funde A+C con D
ver_replica = true;

module elip(aa,bb,cc) scale([aa,bb,cc]) sphere(r=1);

module cascara_bruta() {
  difference() {
    elip(a+holgura+pared_ac, b+holgura+pared_ac, c+holgura+pared_ac);
    elip(a+holgura, b+holgura, c+holgura);
  }
}

module boveda() {
  difference() {
    union() {
      intersection() {
        cascara_bruta();
        // dorso + nuca: flancos recortados a lesion
        translate([(x_front+x_rim-10)/2, 0, 90/2-12])
          cube([x_front-(x_rim-10), 2*flanco_lesion_y, 90], center=true);
        // zona orejas: ancho completo para ranuras
        translate([x_ear, 0, 20])
          cube([ranura_l+20, b+holgura+pared_ac+10, 70], center=true);
      }
      // Fase 2.1: falda caudal continua hacia anillo D (sin gap nuca)
      translate([x_rim-8, 0, -c-holgura-8])
        cube([falda_largo, 2*flanco_lesion_y+8, anillo_alto+6], center=true);
    }
    for (s=[-1,1])
      translate([x_ear, s*ranura_sep/2, 30]) cube([ranura_l, ranura_w, 90], center=true);
    for (vx=[10,-2,-14,-26]) for (vy=[-34,0,34])
      if (!(abs(vy)<6 && vx>-10 && vx<4))
        translate([vx,vy,30]) cylinder(d=vent_d, h=60, center=true);
  }
}

module anillo() {
  ri = anillo_circ/(2*PI);
  difference() {
    cylinder(r=ri+pared_tpu, h=anillo_alto, center=true);
    cylinder(r=ri, h=anillo_alto+2, center=true);
  }
}

if (ver_replica) color("silver", 0.35) elip(a,b,c);
color("orangered") boveda();
// Anillo alineado con falda (sin gap)
translate([x_rim-falda_largo/2-5, 0, -c-holgura-anillo_alto/2-6])
  rotate([0, 15, 0]) color("purple") anillo();
