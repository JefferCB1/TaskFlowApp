// history_renderer.js

// Esperamos a que todo el HTML de la página (history.html) esté cargado y listo.
window.addEventListener('DOMContentLoaded', () => {
  
  // Buscamos en el HTML el elemento <ul> donde mostraremos la lista.
  const historyList = document.getElementById('history-list');
  const exportBtn = document.getElementById('export-btn');

  // Añadimos la función al botón de exportar
  exportBtn.addEventListener('click', () => {
    window.api.exportToExcel();
  });

  // Usamos la función que expusimos en preload.js para escuchar
  // cuando el proceso principal (main.js) nos envíe la lista de tareas completadas.
  window.api.onLoadHistory((completedTasks) => {
    
    // Si por alguna razón no encontramos ese elemento, detenemos el script para evitar errores.
    if (!historyList) {
      console.error('Error: No se encontró el elemento con id "history-list".');
      return;
    }
    
    // Primero, limpiamos la lista por si tenía algo antes.
    historyList.innerHTML = '';
    // Comprobamos si la lista que recibimos tiene elementos.
    if (completedTasks && completedTasks.length > 0) {
      // Si SÍ tiene tareas, las recorremos una por una (en orden inverso para ver las más nuevas primero).
      completedTasks.slice().reverse().forEach(task => {
        // Por cada tarea, creamos un nuevo elemento <li> en la memoria.
        const listItem = document.createElement('li');
        
        // Creamos un formato de fecha más legible.
        const completionDate = new Date(task.completedAt).toLocaleString('es-CO', {
          day: 'numeric', month: 'long', year: 'numeric', 
          hour: '2-digit', minute: '2-digit'
        });

        // Le ponemos el contenido HTML que queramos, usando los datos de la tarea.
        listItem.innerHTML = `
          <strong>${task.title}</strong>
          <p>${task.description || '<em>Sin descripción.</em>'}</p>
          ${task.comment ? `<p class="comment">Comentario: ${task.comment}</p>` : ''}
          <small>Completada: ${completionDate}</small>
        `;
        
        // Añadimos el nuevo <li> a nuestra lista <ul> en la página.
        historyList.appendChild(listItem);
      });
    } else {
      // Si NO hay tareas completadas, creamos un elemento y mostramos un mensaje informativo.
      const emptyMessage = document.createElement('li');
      emptyMessage.innerText = 'Aún no has completado ninguna tarea.';
      historyList.appendChild(emptyMessage);
    }
  });

  // Apenas carga la ventana, le pedimos los datos al cerebro.
  window.api.requestHistoryData();
});