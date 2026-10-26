# ALTUZ · diseño de la landing en toda la tienda Shopify

Una sola vez, en Shopify: Tienda online > Temas > ... > Editar código > `layout/theme.liquid`,
y pega esto justo antes de `</head>`:

```liquid
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Jost:wght@300;400;500;700&display=swap">
<link rel="stylesheet" href="https://altuz-ten.vercel.app/shopify-atelier/altuz-store.css">
<script src="https://altuz-ten.vercel.app/shopify-atelier/altuz-store.js" defer></script>
```

Después, cualquier cambio de diseño se hace aquí en VS Code (`altuz-store.css` / `altuz-store.js`) con commit y push.
La página de contraseña de la tienda usa `layout/password.liquid`; si quieres el mismo fondo ahí, pega las mismas líneas en ese archivo.
