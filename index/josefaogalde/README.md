# josefaogalde.com — Portfolio

Sitio personal: trabajos + contacto.

## Ver en local (Laravel unificado)

```bat
git pull
ABRIR-LARAVEL.bat
```

Abrir:

- `http://127.0.0.1:8000/index/josefaogalde/`
- Contacto: `http://127.0.0.1:8000/index/josefaogalde/#contacto`

## Archivos

| Archivo | Uso |
|---------|-----|
| `index.html` | Landing |
| `assets/site.css` | Estilos |
| `assets/site.js` | Acordeón trabajos + formulario |

## Contacto (formulario)

El formulario **no usa servidor**: abre WhatsApp (`wa.me/56966047614`) o `mailto:josefaogalde@gmail.com` con el mensaje listo.

## Apuntar el dominio josefaogalde.com

1. Hosting / DNS del dominio → misma máquina o estático donde sirvas este repo (o solo esta carpeta).
2. Document root del dominio = esta carpeta `index/josefaogalde/`  
   (así `https://josefaogalde.com/` carga el portfolio).
3. Alternativa: dejar el dominio apuntando al sitio Laravel y redirigir `/` del host `josefaogalde.com` a `/index/josefaogalde/` (regla en Apache/Nginx o middleware).

Mientras el DNS no esté listo, usá la URL Laravel de arriba.
