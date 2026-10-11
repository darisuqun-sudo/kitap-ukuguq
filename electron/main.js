const { app, BrowserWindow, ipcMain, dialog, clipboard, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'كىتابخۇمار - PDF كىتاب ئوقۇغۇچ',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows local file access for PDFs
    },
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: true,
  });

  const devUrl = process.env.VITE_DEV_SERVER === 'true' ? 'http://localhost:5173' : 'http://127.0.0.1:3210';

  mainWindow.loadURL(devUrl).catch(() => {
    setTimeout(() => mainWindow.loadURL(devUrl), 800);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Native file open dialog for PDFs
ipcMain.handle('dialog:openPdf', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'PDF كىتابنى تاللاڭ',
    filters: [
      { name: 'PDF كىتابلار', extensions: ['pdf'] }
    ],
    properties: ['openFile', 'multiSelections']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  // Return file metadata and content as base64/arrayBuffer
  const filesData = result.filePaths.map(filePath => {
    const fileName = path.basename(filePath);
    const buffer = fs.readFileSync(filePath);
    return {
      name: fileName,
      path: filePath,
      size: buffer.length,
      data: buffer.toString('base64'),
    };
  });

  return filesData;
});

// Native save screenshot dialog
ipcMain.handle('dialog:saveScreenshot', async (event, { base64Data, defaultName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'تارتىلغان رەسىمنى ساقلاش',
    defaultPath: defaultName || `kitap-screenshot-${Date.now()}.png`,
    filters: [{ name: 'PNG رەسىم', extensions: ['png'] }]
  });

  if (!result.canceled && result.filePath) {
    const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(result.filePath, Buffer.from(base64Image, 'base64'));
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});

// Copy screenshot to system clipboard
ipcMain.handle('clipboard:copyImage', async (event, base64Data) => {
  try {
    const image = nativeImage.createFromDataURL(base64Data);
    clipboard.writeImage(image);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
