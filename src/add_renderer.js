// src/add_renderer.js

window.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');

    // Esta bandera nos dirá si estamos añadiendo una tarea nueva o editando una existente.
    let isEditMode = false;

    // Escuchamos si el cerebro (main.js) nos envía una tarea para editar.
    window.api.onLoadTaskForEdit((task) => {
        // Si recibimos una tarea, activamos el modo edición y rellenamos los campos.
        isEditMode = true; 
        titleInput.value = task.title;
        descriptionInput.value = task.description;
    });

    // Este es el listener para cuando se envía el formulario (al hacer clic en "Guardar Tarea").
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenimos que la página se recargue.

        // Creamos un objeto con los datos actuales de los campos del formulario.
        const taskData = {
            title: titleInput.value,
            description: descriptionInput.value
        };

        // Comprobamos el modo en el que estamos.
        if (isEditMode) {
            // Si es modo edición, llamamos a la función para ACTUALIZAR.
            window.api.updateTask(taskData);
        } else {
            // Si es modo añadir, llamamos a la función para AÑADIR.
            window.api.sendTask(taskData);
        }
    });
});