// src/main.js
const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const xlsx = require('xlsx');

const userDataPath = app.getPath('userData');
const tasksFilePath = path.join(userDataPath, 'tasks.json');

let mainWindow, addWindow, historyWindow, commentWindow;
let taskToComplete = null;

function readTasksFromFile() { try { const data = fs.readFileSync(tasksFilePath, 'utf-8'); return JSON.parse(data); } catch (error) { return { active: [], completed: [] }; } }
function saveTasksToFile(tasksObject) { const data = JSON.stringify(tasksObject, null, 2); fs.writeFileSync(tasksFilePath, data); }

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay(); const { width, height } = primaryDisplay.workAreaSize; const windowWidth = 500; const windowHeight = 600; const xPos = width - windowWidth; const yPos = height - windowHeight;
  // El bloque con la nueva línea de 'icon'
mainWindow = new BrowserWindow({
  width: windowWidth, height: windowHeight,
  x: xPos, y: yPos,
  resizable: false, alwaysOnTop: true,
  autoHideMenuBar: true, movable: false,
  icon: path.join(__dirname, '../assets/icon.ico'), // <-- AÑADE ESTA LÍNEA
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    sandbox: false 
  }
});
  mainWindow.webContents.on('did-finish-load', () => { const allTasks = readTasksFromFile(); mainWindow.webContents.send('tasks:load', allTasks); });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function createAddWindow() {
  if (addWindow) { addWindow.focus(); return; }
  addWindow = new BrowserWindow({ width: 400, height: 350, title: 'Agregar Tarea', parent: mainWindow, modal: true, show: false, autoHideMenuBar: true, alwaysOnTop: true, webPreferences: { preload: path.join(__dirname, 'preload.js'), sandbox: false } });
  addWindow.loadFile(path.join(__dirname, 'add.html'));
  addWindow.once('ready-to-show', () => { addWindow.show(); });
  addWindow.on('closed', () => { addWindow = null; });
}

function createHistoryWindow() {
    if (historyWindow) { historyWindow.focus(); return; }
    historyWindow = new BrowserWindow({ width: 500, height: 600, title: 'Historial de Tareas', parent: mainWindow, modal: true, show: false, autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.js'), sandbox: false } });
    historyWindow.loadFile(path.join(__dirname, 'history.html'));
    historyWindow.once('ready-to-show', () => { historyWindow.show(); });
    historyWindow.on('closed', () => { historyWindow = null; });
}

function createCommentWindow() {
  if (commentWindow) { commentWindow.focus(); return; }
  commentWindow = new BrowserWindow({ width: 400, height: 250, title: 'Añadir Comentario', parent: mainWindow, modal: true, show: false, autoHideMenuBar: true, alwaysOnTop: true, webPreferences: { preload: path.join(__dirname, 'preload.js'), sandbox: false } });
  commentWindow.loadFile(path.join(__dirname, 'comment.html'));
  commentWindow.once('ready-to-show', () => { commentWindow.show(); });
  commentWindow.on('closed', () => { commentWindow = null; });
}

app.whenReady().then(() => {
  createWindow();

  // --- OYENTES DE MENSAJES ---
  ipcMain.on('show-add-task-window', createAddWindow);
  ipcMain.on('show-history-window', createHistoryWindow);

  // NUEVO OYENTE QUE RESPONDE A LA PETICIÓN DEL HISTORIAL
  ipcMain.on('request-history-data', (event) => {
    const allTasks = readTasksFromFile();
    event.sender.send('load-history', allTasks.completed);
  });

  ipcMain.on('export-to-excel', () => {
    const allTasks = readTasksFromFile(); const completedTasks = allTasks.completed;
    if (completedTasks.length === 0) { dialog.showMessageBox(mainWindow, { type: 'info', title: 'Exportar Historial', message: 'No hay tareas completadas para exportar.' }); return; }
    dialog.showSaveDialog(mainWindow, { title: 'Guardar Historial en Excel', defaultPath: `historial-taskflow-${new Date().toISOString().split('T')[0]}.xlsx`, filters: [{ name: 'Excel Files', extensions: ['xlsx'] }] }).then(result => {
      if (!result.canceled && result.filePath) {
        const dataForSheet = completedTasks.map(task => ({ 'Título': task.title, 'Descripción': task.description, 'Comentario Final': task.comment, 'Fecha de Finalización': new Date(task.completedAt).toLocaleString('es-CO') }));
        const worksheet = xlsx.utils.json_to_sheet(dataForSheet);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Historial');
        xlsx.writeFile(workbook, result.filePath);
        dialog.showMessageBox(mainWindow, { type: 'info', title: 'Éxito', message: 'El historial se ha exportado correctamente a Excel.' });
      }
    }).catch(err => { dialog.showErrorBox('Error al Exportar', `Ha ocurrido un error: ${err.message}`); });
  });

  ipcMain.on('show-edit-window', (event, task) => { createAddWindow(); addWindow.webContents.on('did-finish-load', () => { addWindow.webContents.send('load-task-for-edit', task); }); });
  ipcMain.on('task:add', (event, task) => { const allTasks = readTasksFromFile(); allTasks.active.push(task); saveTasksToFile(allTasks); mainWindow.webContents.send('tasks:load', allTasks); if (addWindow) addWindow.close(); });
  ipcMain.on('task:update', (event, updatedTask) => { const allTasks = readTasksFromFile(); if (allTasks.active.length > 0) { allTasks.active[0] = updatedTask; } saveTasksToFile(allTasks); mainWindow.webContents.send('tasks:load', allTasks); if (addWindow) addWindow.close(); });
  ipcMain.on('task:start-completion', (event, task) => { taskToComplete = task; createCommentWindow(); });
  ipcMain.on('task:submit-comment', (event, comment) => { const allTasks = readTasksFromFile(); const taskIndex = allTasks.active.findIndex(t => t.title === taskToComplete.title && t.description === taskToComplete.description); if (taskIndex > -1) { const task = allTasks.active.splice(taskIndex, 1)[0]; task.comment = comment; task.completedAt = new Date().toISOString(); allTasks.completed.push(task); saveTasksToFile(allTasks); mainWindow.webContents.send('tasks:load', allTasks); } if (commentWindow) commentWindow.close(); });

  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});