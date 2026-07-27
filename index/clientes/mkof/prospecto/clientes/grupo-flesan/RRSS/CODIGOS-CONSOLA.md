# Códigos de consola · Grupo Flesan

Abrí cada perfil **logueada** en Chrome/Edge → `F12` → pestaña **Console** → pegá el bloque → Enter.  
Copiá el JSON que imprime y mandamelo (o pegalo acá).

Perfiles:

- IG: https://www.instagram.com/grupoflesan/
- FB: https://www.facebook.com/grupoflesanchile
- YT: https://www.youtube.com/@GrupoFlesan
- Competencia IG (opcional): https://www.instagram.com/echeverria.izquierdo/

---

## 1) Instagram — números del perfil

Entrá a `https://www.instagram.com/grupoflesan/` (esperá que cargue el perfil) y pegá:

```js
(() => {
  const out = { canal: "instagram", url: location.href, ts: new Date().toISOString() };

  // Texto visible (fallback)
  const meta = [...document.querySelectorAll("header li, header span")]
    .map((el) => el.innerText.trim())
    .filter(Boolean);
  out.visible = meta.slice(0, 40);

  // Datos embebidos en scripts / shared data
  const blobs = [];
  for (const s of document.scripts) {
    const t = s.textContent || "";
    if (t.includes("edge_followed_by") || t.includes("follower_count") || t.includes('"User"')) {
      blobs.push(t.slice(0, 500000));
    }
  }

  const pick = (re, text) => {
    const m = text.match(re);
    return m ? m[1] : null;
  };

  let found = null;
  for (const t of blobs) {
    const followers = pick(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/, t)
      || pick(/"follower_count"\s*:\s*(\d+)/, t);
    const following = pick(/"edge_follow"\s*:\s*\{\s*"count"\s*:\s*(\d+)/, t)
      || pick(/"following_count"\s*:\s*(\d+)/, t);
    const posts = pick(/"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*(\d+)/, t)
      || pick(/"media_count"\s*:\s*(\d+)/, t);
    const user = pick(/"username"\s*:\s*"([^"]+)"/, t);
    const name = pick(/"full_name"\s*:\s*"([^"]*)"/, t);
    const bio = pick(/"biography"\s*:\s*"((?:\\.|[^"\\])*)"/, t);
    if (followers || posts) {
      found = {
        username: user,
        full_name: name,
        biography: bio ? JSON.parse(`"${bio}"`) : null,
        followers: followers ? Number(followers) : null,
        following: following ? Number(following) : null,
        posts: posts ? Number(posts) : null,
      };
      break;
    }
  }
  out.parsed = found;

  // Últimos posts visibles (caption corto + likes/comments si aparecen)
  out.postsSample = [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')]
    .slice(0, 12)
    .map((a) => ({
      href: a.href,
      img: a.querySelector("img")?.alt || null,
    }));

  console.clear();
  console.log(JSON.stringify(out, null, 2));
  copy?.(JSON.stringify(out, null, 2));
  console.log("%c✅ Copiado al portapapeles (si el browser lo permite)", "color:green;font-weight:bold");
  return out;
})();
```

Si Instagram bloquea el scrape del HTML, usá el **Network**:

1. `F12` → **Network** → filtro `graphql` o `web_profile_info`
2. Recargá el perfil (`F5`)
3. Click en la request que tenga el user → pestaña **Response**
4. O pegá esto en Console (lee la última respuesta cacheada si está en performance):

```js
(() => {
  const entries = performance.getEntriesByType("resource")
    .filter((e) => /web_profile_info|graphql|profilePage/i.test(e.name))
    .map((e) => e.name);
  console.log("URLs candidatas (abrí una en pestaña Network → Response):");
  console.table(entries.slice(0, 20));
  return entries;
})();
```

---

## 2) Instagram — engagement de los últimos posts (aprox.)

En el mismo perfil, scrolleá un poco para que carguen posts, luego:

```js
(() => {
  const links = [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')]
    .map((a) => a.href)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 9);

  console.log("Abrí cada URL (o dejá que el script las abra una a una) y corré el extractor abajo.");
  console.log(links);
  copy?.(JSON.stringify(links, null, 2));
  return links;
})();
```

En **cada** post/reel abierto:

```js
(() => {
  const t = document.body.innerText;
  const likes = (t.match(/([\d.,]+)\s*(likes|Me gusta|me gusta)/i) || [])[1] || null;
  const comments = (t.match(/View all\s*([\d.,]+)\s*comments|Ver los\s*([\d.,]+)\s*comentarios|([\d.,]+)\s*comentarios/i) || [])
    .slice(1).find(Boolean) || null;
  const caption = document.querySelector("h1")?.innerText
    || [...document.querySelectorAll("span")]
      .map((s) => s.innerText)
      .find((x) => x && x.length > 40) || null;
  const out = {
    canal: "instagram_post",
    url: location.href,
    likes,
    comments,
    caption: caption ? caption.slice(0, 280) : null,
    ts: new Date().toISOString(),
  };
  console.log(JSON.stringify(out, null, 2));
  copy?.(JSON.stringify(out, null, 2));
  return out;
})();
```

---

## 3) Facebook — seguidores / me gusta

Entrá a `https://www.facebook.com/grupoflesanchile` y pegá:

```js
(() => {
  const text = document.body.innerText;
  const out = {
    canal: "facebook",
    url: location.href,
    ts: new Date().toISOString(),
    meGusta: (text.match(/([\d.,]+[KkMm]?)\s*(me gusta|likes)/i) || [])[1] || null,
    seguidores: (text.match(/([\d.,]+[KkMm]?)\s*(seguidores|followers)/i) || [])[1] || null,
    siguiendo: (text.match(/([\d.,]+[KkMm]?)\s*(siguiendo|following)/i) || [])[1] || null,
    sample: text.slice(0, 1500),
  };
  console.log(JSON.stringify(out, null, 2));
  copy?.(JSON.stringify(out, null, 2));
  return out;
})();
```

---

## 4) YouTube — suscriptores / vistas (rechequeo)

Entrá a `https://www.youtube.com/@GrupoFlesan` → pestaña **About** / **Información** si aparece, o quedate en el canal, y pegá:

```js
(() => {
  const text = document.body.innerText;
  const out = {
    canal: "youtube",
    url: location.href,
    ts: new Date().toISOString(),
    suscriptores: (text.match(/([\d.,]+[KkMm]?)\s*(subscribers|suscriptores)/i) || [])[1] || null,
    videos: (text.match(/([\d.,]+)\s*(videos)/i) || [])[1] || null,
    vistas: (text.match(/([\d.,]+)\s*(views|visualizaciones)/i) || [])[1] || null,
    sample: text.slice(0, 1200),
  };
  console.log(JSON.stringify(out, null, 2));
  copy?.(JSON.stringify(out, null, 2));
  return out;
})();
```

---

## 5) Competencia (opcional) — Echeverría Izquierdo IG

Misma receta del bloque **1)** en:

https://www.instagram.com/echeverria.izquierdo/

---

## Qué pegarme después

Idealmente un solo mensaje con:

1. JSON de Instagram perfil  
2. JSON de Facebook  
3. JSON de YouTube (si cambió)  
4. 3–5 posts IG (likes/comentarios) si los corriste  

Con eso completo `data/ecosistema-rrss.json`.
