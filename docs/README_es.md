

<div align="center">
  <img src="./assets/images/banner_1.jpg"/>
  
   ![License](https://img.shields.io/badge/license-MIT-lightblue.svg)
   ![Version](https://img.shields.io/badge/version-1.1.1-lightgreen.svg)

</div>

<div align="center">

   [English](../README.md) | [Português](./README_pt.md) | Español | [Français](./README_fr.md) | [简体中文](./README_zh-CN.md)

</div>

---

¡Transforma la visualización de tus metadatos aburridos en una visualización dinámica y colorida! 🎨✨

Typify es un plugin para Obsidian que te permite crear estilos únicos para tus metadatos. Lo que antes estaba limitado a las etiquetas, ahora puede personalizarse para cualquier propiedad de Obsidian.

## Características

- **🎨 Estilos personalizables**: Crea estilos únicos para tus metadatos.

- **✨ 1700+ íconos**: Búsqueda fuzzy integrada para toda la biblioteca de íconos Lucide.

- **🌑 Modo claro/oscuro**: Los colores se adaptan automáticamente a tu tema de Obsidian.

- **🚫 Íconos opcionales**: Soporte para píldoras solo con texto (¡simplemente quita el ícono!).

- **🧩 Íconos personalizados**: ¿Pocos íconos? Puedes usar los tuyos fácilmente.

- **🌍 Internacionalización**: Totalmente traducido a inglés, portugués (Brasil), español, francés y chino simplificado.

- **💾 Exportar/Importar**: Haz copias de seguridad y comparte tus configuraciones fácilmente.

- **📋 Plugin Bases**: Los estilos también funcionan en las vistas de Bases (tabla y tarjetas).

- **🎯 Estilos por propiedad**: Limita un estilo a propiedades específicas usando "Aplica a".

## Cómo Usar

1. **Define la propiedad objetivo**: En la configuración del plugin, escribe el nombre de la propiedad que quieres estilizar (ej: `Status`). Para varias propiedades, sepáralas con comas (ej: `Status, Priority`).

2. **Crea el estilo del valor**:
   - Ve a **Configuración > Typify**.
   - Haz clic en "Crear estilo".
   - En el campo **Nombre del estilo**, escribe el texto que quieres convertir en píldora (ej: `Hecho`).
   - Elige un color base y un ícono, o déjalo sin ícono.
   - Opcionalmente, usa **Aplica a** para limitar el estilo a propiedades específicas.

3. **Usa tu nuevo estilo**: En las propiedades de tu nota (YAML), usa la propiedad y el valor que configuraste (ej: `Status: En Progreso`).

¡Voilá! Tu propiedad ahora es una hermosa píldora colorida ✨

## Instalación

### Instalación Manual
1. Descarga la última versión: `main.js`, `manifest.json` y `styles.css`.

2. Crea una carpeta llamada `typify` dentro del directorio `.obsidian/plugins/`.

3. Pega los archivos allí.

4. Recarga Obsidian y activa el plugin.

## Avisos

> [!Important]  
> El efecto del estilo solo se aplica a propiedades del tipo **Lista** en Obsidian.

> [!Note]  
> El plugin no distingue entre mayúsculas y minúsculas, tanto en el nombre de la propiedad como en los valores. Ejemplo: `Status` y `status` se tratan como la misma propiedad.

> [!Note]  
> Si dos estilos comparten el mismo nombre pero tienen ámbitos diferentes (ej: uno en "Todas las propiedades" y otro en una propiedad específica), el estilo más específico tendrá prioridad para esa propiedad.

> [!Tip]  
> Puedes usar varias propiedades como objetivo. Solo agrega una coma entre ellas. Ejemplo: `Status, Priority`.

> [!Warning]  
> La importación de configuraciones **reemplaza todos los estilos existentes**. Los estilos creados después del respaldo se perderán.

## Desarrollo

Si quieres compilar el plugin tú mismo, haz lo siguiente:

1. Clona este repositorio.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev` para iniciar la compilación en modo watch.


## Aviso Legal

Este plugin nació de mi deseo de tener más opciones de personalización para las propiedades, similar a Notion, pero al estilo Obsidian.

Vale mencionar que sin la gran ayuda de [Antigravity](https://antigravity.google/) nada de esto habría sido posible. Por supuesto, no hubo magia con un solo clic, sino cuidado con cada prompt, además de mucha revisión y pruebas.

Esto no fue "vibecodado" de cualquier manera. Tuve que cambiar varias cosas manualmente, pero no es a prueba de balas. Si encuentras algún bug, por favor abre un issue y haré lo máximo posible para corregirlo.

Si quieres contribuir al proyecto, no dudes en abrir un pull request. O si no te sientes cómodo usando código generado por máquina y quieres hacer tu propia versión hecha a mano, siéntete libre de hacerlo también. Solo avísame, porque me encantan los plugins nuevos 😉.
