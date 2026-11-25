# GeoGo

GeoGo es una aplicación educativa e interactiva orientada a la exploración de países, la comparación de información geográfica y el aprendizaje mediante desafíos. Su interfaz en español combina la visualización de datos, la cartografía interactiva y la gamificación en una experiencia moderna e intuitiva.

## Funcionalidades principales

### Explorar

Permite consultar un catálogo de países mediante búsquedas por nombre, filtros por región y favoritos, criterios de ordenación y visualización en formato de tarjetas o lista.

La ficha de cada país presenta información geográfica, demográfica y cultural, complementada con un mapa interactivo, las condiciones meteorológicas actuales y la hora local de su capital, según la disponibilidad de los datos.

### Comparar

Facilita el análisis comparativo entre dos países mediante indicadores de población, superficie y densidad poblacional, representados a través de barras animadas, diferencias numéricas y porcentajes.

También permite contrastar información sobre capitales, idiomas, monedas, condiciones meteorológicas y horarios locales.

### Desafíos

Ofrece cuatro modalidades de aprendizaje basadas en banderas, capitales, población y regiones. Cada partida consta de cinco preguntas y otorga 10 puntos de experiencia (XP) por cada respuesta correcta al completarse.

El sistema de gamificación incorpora niveles, récords, estadísticas de rendimiento e insignias que permiten visualizar el progreso alcanzado.

### Personalización y persistencia

La aplicación dispone de modos claro y oscuro, animaciones, transiciones y un diseño adaptable a diferentes tamaños de pantalla.

Los países favoritos, el progreso de los desafíos y las preferencias de apariencia se almacenan localmente en el dispositivo.

## Tecnologías utilizadas

- **Ionic Angular:** desarrollo de interfaces y navegación.
- **Angular Standalone:** arquitectura y lógica de la aplicación.
- **TypeScript:** desarrollo y tipado del código.
- **SCSS:** personalización visual, estilos y animaciones.
- **RxJS:** gestión de operaciones asíncronas.
- **HttpClient:** consumo de servicios HTTP.
- **Capacitor:** integración con plataformas móviles.
- **Leaflet:** visualización de mapas interactivos.
- **LocalStorage:** persistencia local de información.

## Fuentes de datos

GeoGo integra servicios externos para obtener información geográfica, meteorológica y cartográfica.

- **[REST Countries v3.1](https://restcountries.conventus.de/):** información general y coordenadas de países y capitales.
- **[Open-Meteo](https://open-meteo.com/en/docs):** condiciones meteorológicas actuales y zonas horarias.
- **[OpenStreetMap](https://www.openstreetmap.org/):** información cartográfica para la visualización de mapas interactivos.

## Instalación y ejecución

### Requisitos previos

- Node.js.
- npm.
- Git (opcional para la descarga del repositorio).
- Ionic CLI.

El proyecto fue verificado con Node.js 26 y npm 12.

### 1. Clonar el repositorio

```bash
git clone https://github.com/humiik/geogo.git
```

También es posible descargar el código fuente desde GitHub, seleccionando la rama `main` y la opción **Code → Download ZIP**.

### 2. Instalar las dependencias

Acceder a la carpeta de la aplicación e instalar las dependencias:

```bash
cd geogo
npm ci
```

### 3. Instalar Ionic CLI

En caso de no contar con Ionic CLI, ejecutar:

```bash
npm install -g @ionic/cli
```

### 4. Iniciar la aplicación

```bash
ionic serve
```

La aplicación estará disponible, por defecto, en [http://localhost:8100](http://localhost:8100).

Como alternativa, puede ejecutarse mediante:

```bash
npm start
```

En este caso, la dirección predeterminada es [http://localhost:4200](http://localhost:4200).

**Nota:** se requiere conexión a Internet para consultar el catálogo de países, las condiciones meteorológicas y los mapas interactivos.

## Capturas de pantalla

### Explorar

Catálogo de países con indicadores estadísticos, búsqueda y filtros geográficos.

<img src="docs/screenshots/explorar-catalogo-claro.png" alt="Pestaña Explorar" width="280">

### Comparar

Visualización comparativa de países mediante indicadores geográficos y barras estadísticas.

<img src="docs/screenshots/comparar-duelo-claro.png" alt="Pestaña Comparar" width="280">

### Desafíos

Modalidad de aprendizaje interactivo mediante preguntas y un sistema de gamificación.

<img src="docs/screenshots/desafios-pregunta-bandera.png" alt="Pestaña Desafíos" width="280">

## Manual de usuario

El manual proporciona una descripción visual de las principales funcionalidades de GeoGo, su navegación y sus modalidades de interacción.

[Consultar manual de usuario en PDF](docs/manual-de-usuario.pdf)