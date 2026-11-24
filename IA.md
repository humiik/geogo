# Uso de IA en GeoGo

Se utilizó OpenAI Codex como apoyo para configurar la navegación inicial de GeoGo y conectar la pestaña Explorar con REST Countries. El registro detallado se completará al finalizar el proyecto.

## Catálogo de países en Explorar

- **Fecha y herramienta.** 24 de noviembre de 2026. OpenAI Codex.
- **Encargo.** «Comienza únicamente con el catálogo de países de la pestaña Explorar». El pedido especificó tarjetas con bandera, nombre, capital y región.
- **Trabajo de Codex.** Creó `geogo/src/app/components/country-card/country-card.component.{ts,html,scss}` y actualizó `geogo/src/app/tab1/tab1.page.{ts,html,scss}` para renderizar la respuesta de `CountryService` en una cuadrícula adaptable. También ajustó `geogo/src/app/tab1/tab1.page.spec.ts` y `geogo/e2e/app.spec.ts` para verificar las tarjetas y la navegación después de reintentar.
- **Decisiones técnicas.** Cada tarjeta recibe un `Country` y la lista identifica cada registro con `cca3`. Las banderas se cargan al acercarse a la zona visible. La tarjeta muestra «Sin datos» cuando falta la capital o la región. Se añadió un mensaje para una respuesta vacía y se conservaron los estados de carga, error y reintento.
- **Correcciones.** Se actualizaron las pruebas que verificaban el contador anterior para comprobar el nombre, la bandera, la capital y la región del catálogo.
- **Verificaciones.** `npm run build` terminó correctamente con el aviso existente de Browserslist. Pasaron ESLint, la comprobación de tipos de las pruebas, 6 pruebas unitarias y 1 prueba de Playwright en Microsoft Edge con emulación móvil. Una comprobación adicional de producción con la API real mostró 250 tarjetas, confirmó la carga de la primera bandera y verificó una columna a 320 px y dos a 412 px.
- **Aportes manuales de los integrantes.** El equipo aportó el proyecto y el encargo. Las modificaciones enumeradas en esta entrada fueron realizadas por Codex.
