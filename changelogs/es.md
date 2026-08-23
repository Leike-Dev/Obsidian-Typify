## 1.6.0 | 23 de agosto de 2026

NEW | Modo de color "Contorno": estilo solo con borde y contraste sutil con el fondo del tema.
NEW | "Coincidencia por prefijo" para enlaces asociados: aplica el estilo a cualquier URL que comience con el valor configurado.
NEW | Duplicación de estilos: duplique rápidamente un estilo existente desde el Gestor de estilos.
NEW | Creación de estilos en lote: cree estilos automáticamente para múltiples valores de una vez (hasta 50).
NEW | Ordenación y filtros avanzados en el Gestor de estilos: Reciente, Alfabético, Forma, Icono, Relleno, Enlace.
NEW | Explicaciones detalladas añadidas a cada opción en el modal "Crear estilo".
NEW | Icono exclusivo (sparkles) junto al nombre de Typify en la búsqueda de configuraciones.
NEW | Aviso informativo sobre "Coincidencia por prefijo" añadido al panel de "Avisos del plugin".
NEW | Integración con la Paleta de comandos: busque funciones del plugin y asigne atajos (hotkeys).
NEW | Menú contextual para Enlaces: haga clic derecho en los enlaces para detectar y editar su estilo de URL inteligentemente.
IMP | Migración a la nueva API nativa de configuraciones de Obsidian (requiere Obsidian 1.13.0+).
IMP | "Gestionar estilos" y "Otros estilos" migrados de modales a subpáginas de configuraciones.
IMP | Modal "Paleta de colores" reestructurado con diseño nativo de Obsidian, diseño responsivo e iconos Lucide.
IMP | "Administrar favicons" rediseñado: diseño compacto con selector de proveedor en la barra de búsqueda.
IMP | Modales "Novedades" y "Avisos del plugin" rediseñados con pestañas en píldora y altura fija.
IMP | "Forma" y "Modo de color" preseleccionados por defecto al crear nuevos estilos.
IMP | Término "Todas las propiedades" renombrado a "General" para evitar confusión con "Mostrar todos".
IMP | Estilos aplicados inmediatamente al agregar una propiedad — sin recargar.
IMP | Carga paralela de iconos, imágenes y favicons para un inicio más rápido.
IMP | Caché inteligente de iconos Lucide para actualizaciones visuales más rápidas con muchos estilos.
IMP | Conversión interna de archivos reemplazada por la función nativa de Obsidian.
IMP | READMEs reestructurados en 5 idiomas con nuevos banners y páginas dedicadas de características.
IMP | Badge de patrocinio y badge de la página oficial de Obsidian añadidos a los READMEs.
FIX | CSS de las etiquetas desapareciendo al editar colores en la "Paleta de colores" con configuraciones abiertas.
FIX | SVGs sin `viewBox` rompiendo la interfaz del modal "Crear estilo".
FIX | Iconos/favicons personalizados no desapareciendo al desactivar o mostrándose como cuadrados al reactivar.
FIX | Vistas dinámicas (Canvas, Bases) requiriendo recarga para mostrar nuevos estilos.
FIX | Retraso en la renderización de estilos en ventanas sin foco.
FIX | Eliminar una propiedad ahora limpia sus estilos inmediatamente de la nota abierta.
FIX | "Enlaces asociados" vuelve a mostrar la URL original cuando la propiedad deja de estar estilizada.
FIX | Búsqueda de favicons diferenciada de caché vacío.
FIX | La búsqueda de favicons ya no congela el plugin en sitios lentos.
FIX | Favicon antiguo preservado cuando se pierde la conexión durante la actualización.
FIX | Botón "Reintentar" funciona en sitios marcados como fallo permanente.
FIX | Tamaño de los favicons almacenados mostrado correctamente.
