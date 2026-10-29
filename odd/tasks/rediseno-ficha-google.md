# Rediseño de la web de Pureza a partir de su ficha de Google

Objetivo: adaptar purezabellezanatural.es al ambiente real del salón (fotos de Google Business), modernizarla con ancho máximo, destacar la reserva y volcar horarios y datos públicos.
Rama: `feat/redesign-gbp` · Entrega: una PR · Tests: `npx ng test --watch=false` (vitest) + build + capturas Playwright.

## Specs

- S1 «quiero que mires el negocio de virginia en google my business, sobre todo a sus fotos, y adaptes la página a ese ambiente, incorporando algunas imágenes reconstruyendo el local perfectas para la página.»
- S2 «quiero que le des mas importancia a reservar, resaltandolo o algo.»
- S3 «que le des una vuelta al diseño, conservando esencia, pero mas moderno, con un width maximo, porque tengo full wide y se ve muy mal»
- S4 «analizando toda imagen que no funcione y o generandola o buscate la vida para poner una coherente con el tono de las fotos que has visto.»
- S5 «Pon los servicios que hay en la web tambien en reserve. No quiere que se ponga precio» — hecho en Reserve (13 servicios, precio 0 = oculto). En la web, ningún precio visible.
- S6 «adapta tb horarios, y otra informacion que encuentres de ella en internet»

## Tasks

- T1 (S5, S6) Reserve: servicios, horario de Google, logo real y dorado — inline, aplicado en producción 29 oct 2026 (SQL). ✅
- T2 (S1, S4) Imágenes: fotos reales y recortes en todas las rutas — delegado (escritor) ✅ 691377e
- T3 (S2, S3) Diseño: crema + dorado, 1240 px, cabecera fija con «Reservar cita», logo real — delegado (escritor) ✅ 82ee603, 373a345
- T4 (S6) Datos: horario de Google en pie, contacto y JSON-LD; Instagram; «5,0 en Google · 36 reseñas» sin marcado de reseñas — delegado (escritor) ✅ 6855d8f

## Log

- L1 (29 oct 2026, Sergi): «quiero que mires el negocio de virginia en google my business, sobre todo a sus fotos, y adaptes la página a ese emabiente, incorporando algunas imagens reconstruyendo el local perfectas para la página. tambien, quero que le des mas importancia a reservar, resaltandolo o alog. y que le des una vuelta al diseño, conservando esencia, pero mas moderno, con un width maximo, porque tengo full wide y se ve muy mal, analizando toda imagen que no funcine y o generandola o buscate la vida para poner una coherente con el tono de las fotos que has visto. Pon los servicios que hay en la web tambien en reserve. No quiere que se ponga precio»
- L2 (29 oct 2026, Sergi): «adapta tb orarios, y otra informacion que encuentrtes de ella en internet»
- L3 Investigación: ficha de Google: «Pureza y belleza natural. Peluquería sin químicos en el centro de Ciudad Real», 5,0 con 36 reseñas; Treatwell 5,0 con 58 (ya no reserva por Treatwell); Instagram @pureza_belleza_natural. Horario de Google: L, M, J 10:00–14:00 y 17:00–19:30; V 10:00–19:00; S 10:00–14:00; X y D cerrado. Fresha y Treatwell traen horarios antiguos: se ignoran.
- L4 Fotos: 13 en la ficha. Sesión profesional en 5,5k (hi01 Virginia con tijeras en la mesa, hi02 interior completo, hi03 Virginia con monstera, hi10 Virginia sentada en el salón, hi11 Virginia con tablet, hi12 y hi13 mesa de producto Aveda). Excluidas: niños (g05, g07, g08), selfie de clienta (g04), clienta de espaldas (g06). Logo real: caligrafía dorada «pureza / BELLEZA NATURAL» sobre acuarela rosa y gris; dorado ~#756622.
- L5 La generación de imágenes de Boty devuelve 500 y ComfyUI no está instalado en este PC: se usan recortes de las fotos reales.
- L6 Escritor (29 oct 2026): 4 commits, 340/341 tests (el fallo «pedir» ya estaba en main), build OK, capturas a 2560/1280/390 sin imágenes rotas ni scroll horizontal. Se retiró la sección «Resultados reales» de las páginas de servicio: eran personas generadas por IA; vuelve sola al dejar fotos reales `antes-despues-{planta}-N.jpg`. Pendiente de decisión de Sergi. e2e de capturas sin actualizar.
