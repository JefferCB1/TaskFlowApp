const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Tareas
  sendTask: (task) => ipcRenderer.send('task:add', task),
  updateTask: (task) => ipcRenderer.send('task:update', task),
  onLoadTasks: (callback) => ipcRenderer.on('tasks:load', (_event, value) => callback(value)),
  startCompletion: (task) => ipcRenderer.send('task:start-completion', task),
  submitComment: (comment) => ipcRenderer.send('task:submit-comment', comment),

  // Ventanas
  showAddTaskWindow: () => ipcRenderer.send('show-add-task-window'),
  showEditWindow: (task) => ipcRenderer.send('show-edit-window', task),
  onLoadTaskForEdit: (callback) => ipcRenderer.on('load-task-for-edit', (_event, value) => callback(value)),
  showHistoryWindow: () => ipcRenderer.send('show-history-window'),

  // Historial
  onLoadHistory: (callback) => ipcRenderer.on('load-history', (_event, value) => callback(value)),
  requestHistoryData: () => ipcRenderer.send('request-history-data'), // Pide los datos

  // Excel
  exportToExcel: () => ipcRenderer.send('export-to-excel')
});