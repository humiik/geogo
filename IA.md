# Uso de inteligencia artificial en GeoGo

## 1. Herramientas utilizadas

| Herramienta | Finalidad |
|---|---|
| OpenAI Codex | Asistencia en la implementación de funcionalidades, generación de código, integración de servicios y corrección de errores. |
| Claude | Apoyo en el análisis de alternativas, revisión de soluciones y recomendaciones de desarrollo. |
| ChatGPT | Planificación del proyecto, definición de requerimientos, elaboración de prompts y propuestas de diseño. |

## 2. Solicitudes y prompts principales

Las solicitudes realizadas estuvieron orientadas a resolver necesidades específicas del proyecto, considerando su arquitectura, funcionalidad y experiencia de usuario.

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

La asistencia mediante inteligencia artificial se aplicó a diferentes componentes y servicios. Los siguientes fragmentos simplificados representan algunas de las soluciones técnicas trabajadas durante el desarrollo.

### Consumo de servicios HTTP

Se trabajó en la utilización de servicios independientes para obtener información geográfica mediante HttpClient y Observable.

```typescript
@Injectable({
  providedIn: 'root'
})
export class CountryService {
  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.countriesUrl);
  }
}
```

Esta estructura permite separar las solicitudes HTTP de los componentes visuales y facilita la reutilización de los datos.

### Cálculo de densidad poblacional

Se plantearon soluciones para obtener indicadores derivados de la información geográfica, considerando valores incompletos o inválidos.

```typescript
const density = area > 0
  ? population / area
  : 0;
```

Este cálculo permite incorporar información adicional en las fichas de países y en la sección de comparación.

### Animaciones y efectos visuales

Se solicitaron propuestas de animaciones mediante SCSS para mejorar las transiciones y la presentación de los elementos.

```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.country-card {
  animation: fadeIn 0.4s ease-out;
}
```

El uso de animaciones nativas de CSS permite mejorar la experiencia visual sin depender de librerías adicionales.

## 4. Adaptaciones y mejoras del proyecto

Las propuestas y fragmentos de código obtenidos mediante inteligencia artificial estuvieron sujetos a revisión y adaptación según los requerimientos de GeoGo.

Entre las decisiones y ajustes definidos durante el desarrollo se encuentran:

- Organización de las funcionalidades en tres pestañas principales.
- Personalización de la identidad visual y la paleta de colores.
- Centralización de las traducciones al español.
- Simplificación de las integraciones cartográficas y meteorológicas.
- Optimización de las consultas a servicios externos.
- Conservación de favoritos, preferencias y progreso mediante almacenamiento local.
- Incorporación de animaciones ligeras y componentes reutilizables.
- Exclusión de dependencias que aumentaran innecesariamente la complejidad del proyecto.

La selección de funcionalidades, las decisiones de diseño y la definición del alcance estuvieron guiadas por los requerimientos establecidos por el desarrollador.

## 5. Verificación y control de calidad

También se utilizó asistencia para identificar posibles errores, revisar la estructura del código y establecer criterios de validación.

La revisión contempló los siguientes aspectos:

- Funcionamiento de las tres pestañas.
- Consumo de servicios externos.
- Manejo de errores y datos incompletos.
- Persistencia de información mediante LocalStorage.
- Compatibilidad con dispositivos móviles.
- Rendimiento de las animaciones.
- Compilación y ejecución de pruebas funcionales.

Las soluciones fueron evaluadas considerando su utilidad, compatibilidad y adecuación a los objetivos del proyecto.

