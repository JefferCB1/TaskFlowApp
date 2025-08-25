window.addEventListener('DOMContentLoaded', () => {
  const taskTitleDisplay = document.getElementById('task-title-display');
  const taskDescriptionDisplay = document.getElementById('task-description-display');
  const completeBtn = document.getElementById('complete-btn');
  const editBtn = document.getElementById('edit-btn');
  const showAddTaskWindowBtn = document.getElementById('show-add-task-window-btn');
  const showHistoryBtn = document.getElementById('show-history-btn');

  let activeTasks = [];
  let completedTasks = [];

  const updateUI = () => {
    const hasTasks = activeTasks.length > 0;
    completeBtn.disabled = !hasTasks;
    editBtn.disabled = !hasTasks;
    if (hasTasks) {
      const currentTask = activeTasks[0];
      taskTitleDisplay.innerText = currentTask.title;
      taskDescriptionDisplay.innerText = currentTask.description;
    } else {
      taskTitleDisplay.innerText = '¡Todo listo!';
      taskDescriptionDisplay.innerText = 'Agrega una nueva tarea para empezar.';
    }
  };

  showAddTaskWindowBtn.addEventListener('click', () => { window.api.showAddTaskWindow(); });
  showHistoryBtn.addEventListener('click', () => { window.api.showHistoryWindow(); });
  editBtn.addEventListener('click', () => { if (activeTasks.length > 0) { window.api.showEditWindow(activeTasks[0]); } });
  completeBtn.addEventListener('click', () => { if (activeTasks.length > 0) { window.api.startCompletion(activeTasks[0]); } });

  window.api.onLoadTasks((allTasks) => {
    activeTasks = allTasks.active || [];
    completedTasks = allTasks.completed || [];
    updateUI();
  });
});