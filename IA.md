# Uso de inteligencia artificial en GeoGo

## 1. Herramientas utilizadas

| Herramienta | Finalidad |
|---|---|
| OpenAI Codex | Asistencia en la implementación de funcionalidades, generación de código, integración de servicios y corrección de errores. |
| Claude | Apoyo en el análisis de alternativas, revisión de soluciones y recomendaciones de desarrollo. |
| ChatGPT | Planificación del proyecto, definición de requerimientos, elaboración de prompts y propuestas de diseño. |

## 2. Solicitudes y prompts principales

La solicitud principal fue desarrollar GeoGo como una aplicación educativa en español para explorar países, comparar datos y practicar geografía. Durante el desarrollo se formularon solicitudes específicas sobre la arquitectura, las funcionalidades y la experiencia de uso.

### Estructura y consumo de datos

> Desarrolla una aplicación educativa en español utilizando Ionic, Angular Standalone, TypeScript y RxJS. Organiza el proyecto en tres pestañas principales: Explorar, Comparar y Desafíos.

> Comienza únicamente con el catálogo de países de la pestaña Explorar. Utiliza REST Countries, interfaces tipadas y un servicio independiente para gestionar las solicitudes HTTP.

### Localización al español

> Implementa una solución centralizada y reutilizable para traducir los datos proporcionados por REST Countries. Mantén toda la información y los elementos de la interfaz en español, evitando duplicar la lógica de traducción.

### Comparación de países

> Implementa una comparación entre dos países mediante indicadores numéricos, diferencias porcentuales y barras visuales. Utiliza el primer país como referencia para calcular los porcentajes e incorpora una opción para intercambiar los países seleccionados.

### Desafíos y gamificación

> Genera preguntas dinámicas utilizando los datos de REST Countries. Implementa cuatro modalidades de juego, cinco preguntas por partida, retroalimentación visual y un sistema de experiencia, niveles e insignias.

### Diseño y experiencia de usuario

> Mejora la identidad visual de GeoGo mediante una estética moderna inspirada en la exploración geográfica. Utiliza gradientes, iluminaciones ambientales, animaciones, microinteracciones y modos claro y oscuro, sin incorporar dependencias gráficas innecesarias.

### Integración de servicios externos

> Integra mapas interactivos mediante Leaflet y OpenStreetMap. Utiliza Open-Meteo para consultar las condiciones meteorológicas actuales y la zona horaria de las capitales únicamente cuando sea necesario.

## 3. Ejemplos de asistencia en la generación de código

### Consumo de servicios HTTP y localización

Codex implementó la consulta a REST Countries en `CountryService` y la transformación de los datos en `localizeCountry()`. El servicio comparte el catálogo ya localizado entre Explorar, Comparar y Desafíos. La localización utiliza los nombres en español del proveedor, un diccionario para variantes geográficas y `Intl.DisplayNames` para resolver nombres de idiomas y monedas. [Servicio de países](geogo/src/app/services/country.service.ts) · [Localización](geogo/src/app/i18n/localize-country.ts)

Durante la auditoría, una respuesta con una capital en un formato inesperado provocó un error general. Codex incorporó `readRestCountry()` para validar cada registro y omitir los campos opcionales inválidos antes de traducir los datos. La prueba de regresión comprueba que el catálogo sigue disponible cuando la respuesta combina registros válidos e incompletos. [Validación del catálogo](geogo/src/app/models/country.ts) · [Prueba de regresión](geogo/src/app/tab1/tab1.page.spec.ts)

```typescript
const catalog = countries.flatMap((item: unknown) => {
  const country = readRestCountry(item);
  return country ? [localizeCountry(country)] : [];
});
```

### Cálculo de indicadores demográficos

Codex centralizó el cálculo de densidad y diferencias en `country-metrics.ts`. La densidad requiere una superficie mayor que cero. La diferencia porcentual usa el primer país como referencia y queda sin valor cuando faltan datos o la referencia es cero. Así se evita mostrar un porcentaje que no se puede calcular. [Cálculo de indicadores](geogo/src/app/models/country-metrics.ts)

```typescript
const percent = difference !== null && first !== null && first > 0 ? (difference / first) * 100 : null;
```

### Generación de preguntas y registro del progreso

Codex implementó la generación de preguntas a partir del catálogo de países y el registro de partidas completadas. El generador considera las capitales múltiples y evita que una respuesta válida aparezca como distractor. Cada partida se registra con un identificador único para evitar que se contabilice dos veces. [Generación de preguntas](geogo/src/app/services/quiz.service.ts) · [Registro de partidas](geogo/src/app/services/storage.service.ts)

## 4. Adaptaciones y correcciones del proyecto

- **Clima y hora local.** Se trasladó la inyección de los servicios al constructor y el inicio de las consultas a `ngOnInit`. La carga sigue realizándose al abrir una ficha o comparar dos países. [Panel de clima](geogo/src/app/components/capital-weather.component.ts)
- **Imágenes de los desafíos.** Si falla la bandera SVG, el juego intenta cargar el PNG. Si tampoco está disponible, permite reintentar y conserva la pregunta y el puntaje. [Prueba de recuperación de banderas](geogo/e2e/remaining-features.spec.ts)
- **Navegación y mapa.** Se añadió una redirección a Explorar para direcciones desconocidas y se corrigió el aviso del mapa para que desaparezca cuando se descartan las teselas fallidas. [Rutas](geogo/src/app/tabs/tabs.routes.ts) · [Componente del mapa](geogo/src/app/components/capital-map.component.ts)

## 5. Verificación y control de calidad

Las correcciones se comprobaron con `npm run build`, `npm run lint` y `npm test`. Pasaron 9 pruebas unitarias y 12 pruebas de navegador. También se verificaron el catálogo, el mapa y el clima, la comparación de países y el inicio de los desafíos con datos de los servicios externos.
