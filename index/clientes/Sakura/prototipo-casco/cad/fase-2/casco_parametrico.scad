// @sakura-casco  Fase 2 - maestro parametrico (editable)  | unidades: mm
// Ejes: +x rostral (hocico) | -x caudal (nuca) | +z dorsal
$fn = 96;

/* ===================== PARAMETROS ===================== */
a = 60; b = 50; c = 30;       // semiejes craneo (largo120 x ancho100 x alto60)
holgura   = 3;                // holgura interior sobre piel
pared_ac  = 2;                // espesor cascara PETG (A+C)
x_front   = 20;               // borde frontal (DETRAS de ojos/vibrisas)
x_rim     = -55;              // borde caudal (>=50 mm tras base oreja)
x_ear     = -5;               // x de la base de las orejas
ranura_l  = 80; ranura_w = 27;// ranuras de orejas (abiertas)
ranura_sep= 30;               // separacion entre ejes de ranuras
vent_d    = 5;                // diametro perforaciones ventilacion
anillo_circ = 207;            // circ. interior anillo D (cuello)
pared_tpu = 1.5;              // pared TPU
anillo_alto = 12;
ver_replica = true;           // mostrar gemelo digital de fondo

/* ===================== MODULOS ===================== */
module elip(aa,bb,cc) scale([aa,bb,cc]) sphere(r=1);

module boveda() {
  difference() {
    intersection() {
      difference() {  // cascara entre exterior e interior
        elip(a+holgura+pared_ac, b+holgura+pared_ac, c+holgura+pared_ac);
        elip(a+holgura, b+holgura, c+holgura);
      }
      // cobertura: dorso + nuca + flancos (abre cara y vientre)
      translate([(x_front+x_rim-10)/2, 0, 90/2-12])
        cube([x_front-(x_rim-10), 200, 90], center=true);
    }
    for (s=[-1,1])                                   // ranuras B
      translate([x_ear, s*ranura_sep/2, 30]) cube([ranura_l, ranura_w, 90], center=true);
    for (vx=[10,-2,-14,-26]) for (vy=[-34,0,34])     // ventilacion
      if (!(abs(vy)<6 && vx>-10 && vx<4))
        translate([vx,vy,30]) cylinder(d=vent_d, h=60, center=true);
  }
}

module anillo() {                                    // D (TPU)
  ri = anillo_circ/(2*PI);
  difference() {
    cylinder(r=ri+pared_tpu, h=anillo_alto, center=true);
    cylinder(r=ri, h=anillo_alto+2, center=true);
  }
}

/* ===================== ENSAMBLE ===================== */
if (ver_replica) color("silver", 0.35) elip(a,b,c);
color("orangered") boveda();
translate([-58,0,-20]) rotate([0,70,0]) color("purple") anillo();
