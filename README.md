# 🐱 Macarena Rescatagatos

Un juego retro estilo pixel art donde juegas como Macarena, una chica morena con lentes que debe rescatar gatos callejeros en una ciudad pixelada.

## 🎮 Características del Juego

### Estilo Visual
- **Estética pixel art** inspirada en GameBoy y NES
- **Vista top-down** (desde arriba)
- **Paleta de 4 colores**: Blanco, gris claro, gris oscuro y negro (con verde para UI)
- **Animaciones básicas** de caminar para Macarena
- **Animaciones simples** para gatos moviéndose

### Controles
- **Flechas del teclado** (↑↓←→) o **WASD** para mover a Macarena
- **Barra espaciadora** para interactuar con gatos y resolver minijuegos

### Mecánicas de Juego
- Macarena se mueve por una ciudad dividida en tiles
- **3 gatos por nivel** escondidos en el mapa
- **Minijuegos de secuencia** al acercarse a un gato
- **Sistema de tiempo límite** - rescata todos los gatos antes de que se acabe el tiempo
- **Progresión de niveles** con dificultad creciente

### Características Especiales
- **Radar de proximidad** que se intensifica al estar cerca de un gato
- **Colección de gatos rescatados** con nombres únicos y frases graciosas
- **Sistema de guardado** que mantiene tu colección de gatos
- **Mapas procedurales** con edificios y obstáculos

## 🚀 Cómo Jugar

1. **Abre el archivo `index.html`** en tu navegador web
2. **Haz clic en "JUGAR"** para comenzar
3. **Usa las flechas** para mover a Macarena por la ciudad
4. **Observa el radar** en la parte inferior - se ilumina cuando hay gatos cerca
5. **Acércate a los gatos** y presiona **Espacio** para iniciar el minijuego
6. **Memoriza la secuencia** de flechas que aparece
7. **Repite la secuencia** usando las flechas del teclado
8. **¡Rescata los 3 gatos** antes de que se acabe el tiempo!

## 📋 Instrucciones Detalladas

### Objetivo
Rescatar 3 gatos en cada nivel antes de que se agote el tiempo (60 segundos).

### Radar de Proximidad
- El radar verde en la parte inferior se ilumina cuando estás cerca de un gato
- Mientras más cerca estés, más intenso será el brillo
- El punto rojo en el centro cambia de tamaño y color según la proximidad

### Minijuegos
- Cuando te acerques a un gato, aparecerá un minijuego de secuencia
- Observa la secuencia de flechas que se muestra
- Repite exactamente la misma secuencia usando las flechas del teclado
- Si te equivocas, la secuencia se reinicia
- ¡Completa la secuencia para rescatar al gato!

### Colección de Gatos
- Cada gato rescatado se guarda en tu colección personal
- Cada gato tiene un nombre único y una frase graciosa
- Tu colección se mantiene guardada entre sesiones de juego
- Accede a tu colección desde el menú principal

### Progresión
- Cada nivel aumenta ligeramente la dificultad
- Los gatos se mueven más rápido en niveles superiores
- A partir del nivel 4, pueden aparecer más de 3 gatos por nivel

## 🛠️ Tecnologías Utilizadas

- **HTML5 Canvas** para renderizado de gráficos
- **JavaScript puro** sin dependencias externas
- **CSS3** para interfaz de usuario
- **LocalStorage** para guardar progreso

## 🎨 Paleta de Colores

- **Blanco** (#FFFFFF) - Fondo principal
- **Gris Claro** (#AAAAAA) - Elementos secundarios
- **Gris Oscuro** (#555555) - Edificios y detalles
- **Negro** (#000000) - Contornos y texto
- **Verde** (#00FF00) - Interfaz de usuario y efectos

## 🎵 Características Adicionales

- **Interfaz retro** con tipografía monoespaciada
- **Efectos visuales** en el radar de proximidad
- **Animaciones suaves** para personajes
- **Sistema de menús** intuitivo
- **Responsive design** que se adapta a diferentes tamaños de pantalla

## 📱 Compatibilidad

El juego funciona en cualquier navegador moderno que soporte:
- HTML5 Canvas
- JavaScript ES6
- CSS3
- LocalStorage

**Navegadores recomendados:**
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 🐛 Solución de Problemas

**El juego no carga:**
- Asegúrate de que ambos archivos (`index.html` y `game.js`) estén en la misma carpeta
- Verifica que JavaScript esté habilitado en tu navegador

**Los controles no responden:**
- Haz clic en el área del juego para asegurar que tenga el foco
- Verifica que no haya otras aplicaciones capturando las teclas

**El radar no funciona:**
- El radar solo funciona cuando hay gatos sin rescatar en el nivel
- Asegúrate de estar en modo de juego activo

## 🎯 Consejos y Estrategias

1. **Usa el radar** como tu herramienta principal para encontrar gatos
2. **Explora sistemáticamente** el mapa en lugar de moverte aleatoriamente
3. **Practica las secuencias** - los minijuegos se vuelven más complejos
4. **Gestiona tu tiempo** - no te quedes demasiado tiempo en una zona
5. **Memoriza patrones** - algunos gatos tienen comportamientos predecibles

## 🏆 Logros Sugeridos

- **Primer Rescate**: Rescata tu primer gato
- **Rescatista Rápido**: Completa un nivel en menos de 30 segundos
- **Coleccionista**: Rescata 10 gatos diferentes
- **Maestro de Secuencias**: Completa un minijuego sin errores
- **Explorador Urbano**: Alcanza el nivel 5

---

¡Disfruta rescatando gatos con Macarena! 🐱✨