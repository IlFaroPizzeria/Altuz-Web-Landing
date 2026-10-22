# Publicar la web de Altuz

Ya está hecho: esta carpeta con toda la web, y el repositorio git con los archivos guardados. Te queda lo que necesita tus cuentas y tus datos. Son unos 30 minutos.

## 1. Mira la web en tu Mac

En VS Code, abajo a la derecha, pulsa **Go Live**. Se abre en el navegador. El formulario todavía no guarda nada: eso llega en el paso 3.

## 2. Pon tus datos legales

La ley obliga a decir quién está detrás de la web. En VS Code pulsa `Cmd + Shift + F`, busca `<mark>` y cambia cada marca por el dato real, quitando también las etiquetas `<mark>` y `</mark>`:

| Archivo | Qué poner |
| --- | --- |
| `legal.html` | Tu NIF o NIE y tu dirección postal, en inglés y en español. La línea de sociedad solo si creas una SL; si eres autónomo, bórrala. |
| `privacy.html` | NIF o NIE y dirección (dos veces). La región de Supabase que elijas en el paso 3, por ejemplo «Unión Europea (Fráncfort)». El proveedor de correo, o «ninguno por ahora». |
| `cookies.html` | Deja el texto y quita solo las etiquetas `<mark>`. |

Si no quieres publicar la dirección de tu casa, usa la de tu gestoría o un coworking que te dé domicilio.

## 3. Conecta el formulario (Supabase)

1. Entra en [supabase.com](https://supabase.com) y pulsa **New project**. Nombre: `altuz`. Región: **Central EU (Frankfurt)**. Guarda la contraseña que te pida.
2. Cuando esté listo, abre **SQL Editor**, pulsa **New query**, pega todo el contenido de `supabase/schema.sql` y pulsa **Run**.
3. Pulsa **Connect** arriba en el proyecto (o ve a **Project Settings → API Keys**). Copia la **Project URL** (`https://….supabase.co`) y la clave **publishable** (empieza por `sb_publishable_`).
4. Pégalas en `assets/js/config.js`, entre las comillas de `supabaseUrl` y `supabaseAnonKey`.

Nunca pegues la clave **secret** ni la **service_role**: esas no van en la web.

## 4. Guarda los cambios

En VS Code, abre **Source Control** (el icono de las ramas, a la izquierda). Escribe un mensaje, por ejemplo «Datos legales y formulario», y pulsa **Commit**. Si te pregunta si quieres incluir todos los cambios, di que sí.

## 5. Súbela a GitHub

En el mismo panel pulsa **Publish Branch**. Inicia sesión con tu cuenta de GitHub si te lo pide y elige **Publish to GitHub private repository**, con el nombre `altuz-web`.

## 6. Publícala en Vercel

1. Entra en [vercel.com/new](https://vercel.com/new) con tu cuenta de GitHub.
2. Busca `altuz-web` y pulsa **Import**. Si no aparece, pulsa **Adjust GitHub App Permissions** y dale acceso a ese repositorio.
3. En **Project Name** escribe `altuz`. Si está cogido, Vercel te propondrá otro.
4. **Framework Preset: Other**. No toques el resto: no hay comando de build.
5. Pulsa **Deploy**. En unos 30 segundos tendrás la dirección, por ejemplo `altuz.vercel.app`.

## 7. Pon la dirección real en la web

Si tu dirección no es exactamente `altuz.vercel.app`, en VS Code pulsa `Cmd + Shift + H`, busca `altuz.vercel.app`, escribe tu dirección en el campo de reemplazo y pulsa **Replace All**. Luego **Commit** y **Sync Changes**. Vercel la vuelve a publicar solo.

## 8. Comprueba que todo funciona

- Ábrela en el móvil y en el ordenador: la entrada con los faros, la tarjeta y los paneles.
- Prueba el ticket de cookies y abre las páginas legales desde el pie.
- Envía una solicitud con tu correo. En Supabase, **Table Editor → admission_requests**, tiene que aparecer la fila.

## 9. Opcional

- **Visitas:** en Vercel, abre el proyecto → **Analytics** → **Enable**. Solo cuenta a quien acepte «Footfall».
- **Dominio propio:** en Vercel → **Settings → Domains**, añade tu dominio y sigue sus instrucciones de DNS. Después repite el paso 7 con ese dominio.

## A partir de ahora

Cada vez que cambies algo: **Commit** y **Sync Changes** en VS Code. Vercel publica la nueva versión en unos segundos.

## Si algo falla

- **No ves Go Live:** instala la extensión **Live Server** en VS Code, o abre `index.html` con doble clic.
- **El formulario dice que no se pudo enviar:** revisa que `config.js` tiene la URL y la clave publishable sin espacios, y que ejecutaste `schema.sql` en Supabase.
- **VS Code pide tu nombre y correo para git:** en su terminal escribe `git config --global user.name "Nils Lehmann"` y `git config --global user.email "nils.podadera@gmail.com"`.
- **Vercel da error al publicar:** comprueba que elegiste **Other** y que el campo de build está vacío.
