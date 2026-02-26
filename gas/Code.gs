/**
 * Baby Shower List App — Google Apps Script Backend
 *
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Before first use, run setup() once manually from the GAS editor
 * to create the registry spreadsheet and store its ID.
 */

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

/**
 * Run this ONCE manually from the GAS editor (Run → setup).
 * Creates the registry spreadsheet and stores its ID in Script Properties.
 */
function setup() {
  const existing = PropertiesService.getScriptProperties().getProperty('REGISTRY_SHEET_ID');
  if (existing) {
    Logger.log('Registry already exists: ' + existing);
    return;
  }
  const ss = SpreadsheetApp.create('Baby List Registry');
  const sheet = ss.getActiveSheet();
  sheet.setName('lists');
  sheet.appendRow(['listId', 'shareCode', 'adminCode', 'spreadsheetId', 'title', 'createdAt']);
  PropertiesService.getScriptProperties().setProperty('REGISTRY_SHEET_ID', ss.getId());
  Logger.log('Registry created: ' + ss.getId());
  Logger.log('Share this URL with yourself: ' + ss.getUrl());
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

// All requests arrive as GET.
// The action is in e.parameter.action; everything else is JSON-encoded
// in e.parameter.payload (set by the frontend gasClient.ts).
function doGet(e) {
  const action = e.parameter.action;
  const payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : {};
  return handleRequest({ action, ...payload });
}

// doPost kept as fallback (not normally called by the frontend).
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    return handleRequest(body);
  } catch (err) {
    return json({ ok: false, error: 'Invalid JSON body: ' + err.message });
  }
}

function handleRequest(params) {
  const action = params && params.action;
  try {
    switch (action) {
      case 'getList':           return json(getList(params));
      case 'createList':        return json(createList(params));
      case 'addItem':           return json(addItem(params));
      case 'updateItem':        return json(updateItem(params));
      case 'deleteItem':        return json(deleteItem(params));
      case 'reserveItem':       return json(reserveItem(params));
      case 'cancelReservation': return json(cancelReservation(params));
      case 'markPurchased':     return json(markPurchased(params));
      case 'suggestItem':       return json(suggestItem(params));
      default:
        return json({ ok: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return json({ ok: false, error: err.message });
  }
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateCode(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function getRegistrySheet() {
  const id = PropertiesService.getScriptProperties().getProperty('REGISTRY_SHEET_ID');
  if (!id) throw new Error('Registry not set up. Run setup() first.');
  return SpreadsheetApp.openById(id).getSheetByName('lists');
}

/**
 * Find a list entry by shareCode or adminCode.
 * Returns { listId, shareCode, adminCode, spreadsheetId, title, isAdmin }
 */
function findEntry(code) {
  const sheet = getRegistrySheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  // columns: listId(1) shareCode(2) adminCode(3) spreadsheetId(4) title(5) createdAt(6)
  const rows = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row[1] === code || row[2] === code) {
      return {
        listId:        String(row[0]),
        shareCode:     String(row[1]),
        adminCode:     String(row[2]),
        spreadsheetId: String(row[3]),
        title:         String(row[4]),
        isAdmin:       row[2] === code,
      };
    }
  }
  return null;
}

/**
 * Find the row index (1-based) of an item in the items sheet by itemId.
 */
function findItemRow(itemsSheet, itemId) {
  const lastRow = itemsSheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = itemsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(itemId)) return i + 2;
  }
  return -1;
}

function rowToItem(row) {
  return {
    id:                String(row[0]),
    name:              String(row[1]),
    category:          String(row[2]),
    quantity:          Number(row[3]),
    quantityPurchased: Number(row[4]),
    priority:          String(row[5]),
    isReserved:        row[6] === true || row[6] === 'TRUE' || row[6] === 'true',
    reservedBy:        row[7] ? String(row[7]) : null,
    isPurchased:       row[8] === true || row[8] === 'TRUE' || row[8] === 'true',
    purchasedBy:       row[9] ? String(row[9]) : null,
    imageUrl:          row[10] ? String(row[10]) : null,
    notes:             row[11] ? String(row[11]) : '',
    addedBy:           row[12] ? String(row[12]) : '',
    createdAt:         row[13] ? new Date(row[13]).toISOString() : new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function getList(params) {
  const code = params.shareCode || params.adminCode;
  if (!code) return { ok: false, error: 'shareCode or adminCode required' };

  const entry = findEntry(code);
  if (!entry) return { ok: false, error: 'Lista no encontrada' };

  const ss = SpreadsheetApp.openById(entry.spreadsheetId);

  // Read meta (row 2)
  const metaSheet = ss.getSheetByName('meta');
  const metaRow = metaSheet.getRange(2, 1, 1, 7).getValues()[0];

  const list = {
    id:           entry.listId,
    listId:       entry.listId,
    title:        String(metaRow[0]),
    ownerName:    String(metaRow[1]),
    babyName:     String(metaRow[2]),
    dueDate:      String(metaRow[3]),
    shareCode:    String(metaRow[4]),
    adminCode:    entry.isAdmin ? String(metaRow[5]) : undefined,
    googleSheetId: entry.spreadsheetId,
    createdAt:    metaRow[6] ? new Date(metaRow[6]).toISOString() : new Date().toISOString(),
  };

  // Read items
  const itemsSheet = ss.getSheetByName('items');
  const lastRow = itemsSheet.getLastRow();
  let items = [];
  if (lastRow > 1) {
    const rows = itemsSheet.getRange(2, 1, lastRow - 1, 14).getValues();
    items = rows
      .filter(row => row[0] !== '' && row[0] !== null)
      .map(rowToItem);
  }

  return { ok: true, list, items };
}

function createList(body) {
  if (!body || !body.title || !body.ownerName || !body.babyName || !body.dueDate) {
    return { ok: false, error: 'Missing required fields: title, ownerName, babyName, dueDate' };
  }

  const listId    = Utilities.getUuid();
  const shareCode = generateCode(6);
  const adminCode = generateCode(12);
  const now       = new Date().toISOString();

  // Create the list spreadsheet
  const ss = SpreadsheetApp.create(body.title + ' — Baby List');
  const spreadsheetId = ss.getId();

  // meta sheet
  const metaSheet = ss.getActiveSheet();
  metaSheet.setName('meta');
  metaSheet.appendRow(['title', 'ownerName', 'babyName', 'dueDate', 'shareCode', 'adminCode', 'createdAt']);
  metaSheet.appendRow([body.title, body.ownerName, body.babyName, body.dueDate, shareCode, adminCode, now]);

  // items sheet
  const itemsSheet = ss.insertSheet('items');
  itemsSheet.appendRow([
    'itemId', 'name', 'category', 'quantity', 'quantityPurchased',
    'priority', 'isReserved', 'reservedBy', 'isPurchased', 'purchasedBy',
    'imageUrl', 'notes', 'addedBy', 'createdAt',
  ]);

  // Register
  getRegistrySheet().appendRow([listId, shareCode, adminCode, spreadsheetId, body.title, now]);

  return { ok: true, shareCode, adminCode, spreadsheetId, listId };
}

function addItem(body) {
  if (!body.adminCode) return { ok: false, error: 'adminCode required' };
  const entry = findEntry(body.adminCode);
  if (!entry || entry.adminCode !== body.adminCode) return { ok: false, error: 'Unauthorized' };

  const itemId = generateCode(10);
  const now    = new Date().toISOString();
  const ss     = SpreadsheetApp.openById(entry.spreadsheetId);
  ss.getSheetByName('items').appendRow([
    itemId,
    body.name        || '',
    body.category    || 'Otros',
    Number(body.quantity) || 1,
    0,
    body.priority    || 'medium',
    false,
    '',
    false,
    '',
    body.imageUrl    || '',
    body.notes       || '',
    body.addedBy     || '',
    now,
  ]);

  return { ok: true, itemId };
}

function updateItem(body) {
  if (!body.adminCode) return { ok: false, error: 'adminCode required' };
  const entry = findEntry(body.adminCode);
  if (!entry || entry.adminCode !== body.adminCode) return { ok: false, error: 'Unauthorized' };

  const ss         = SpreadsheetApp.openById(entry.spreadsheetId);
  const itemsSheet = ss.getSheetByName('items');
  const rowIndex   = findItemRow(itemsSheet, body.itemId);
  if (rowIndex === -1) return { ok: false, error: 'Item not found' };

  const row = itemsSheet.getRange(rowIndex, 1, 1, 14).getValues()[0];
  if (body.name     !== undefined) row[1]  = body.name;
  if (body.category !== undefined) row[2]  = body.category;
  if (body.quantity !== undefined) row[3]  = Number(body.quantity);
  if (body.priority !== undefined) row[5]  = body.priority;
  if (body.imageUrl !== undefined) row[10] = body.imageUrl || '';
  if (body.notes    !== undefined) row[11] = body.notes    || '';
  itemsSheet.getRange(rowIndex, 1, 1, 14).setValues([row]);

  return { ok: true };
}

function deleteItem(body) {
  if (!body.adminCode) return { ok: false, error: 'adminCode required' };
  const entry = findEntry(body.adminCode);
  if (!entry || entry.adminCode !== body.adminCode) return { ok: false, error: 'Unauthorized' };

  const ss         = SpreadsheetApp.openById(entry.spreadsheetId);
  const itemsSheet = ss.getSheetByName('items');
  const rowIndex   = findItemRow(itemsSheet, body.itemId);
  if (rowIndex === -1) return { ok: false, error: 'Item not found' };

  itemsSheet.deleteRow(rowIndex);
  return { ok: true };
}

function reserveItem(body) {
  if (!body.shareCode || !body.itemId || !body.reservedBy) {
    return { ok: false, error: 'shareCode, itemId, reservedBy required' };
  }
  const entry = findEntry(body.shareCode);
  if (!entry) return { ok: false, error: 'Lista no encontrada' };

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const itemsSheet = SpreadsheetApp.openById(entry.spreadsheetId).getSheetByName('items');
    const rowIndex   = findItemRow(itemsSheet, body.itemId);
    if (rowIndex === -1) return { ok: false, error: 'Item not found' };

    const row = itemsSheet.getRange(rowIndex, 1, 1, 14).getValues()[0];
    const alreadyReserved = row[6] === true || row[6] === 'TRUE' || row[6] === 'true';
    if (alreadyReserved) {
      return { ok: false, error: 'Este artículo ya fue reservado por ' + row[7] };
    }
    row[6] = true;
    row[7] = body.reservedBy;
    itemsSheet.getRange(rowIndex, 1, 1, 14).setValues([row]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function cancelReservation(body) {
  if (!body.shareCode || !body.itemId || !body.reservedBy) {
    return { ok: false, error: 'shareCode, itemId, reservedBy required' };
  }
  const entry = findEntry(body.shareCode);
  if (!entry) return { ok: false, error: 'Lista no encontrada' };

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const itemsSheet = SpreadsheetApp.openById(entry.spreadsheetId).getSheetByName('items');
    const rowIndex   = findItemRow(itemsSheet, body.itemId);
    if (rowIndex === -1) return { ok: false, error: 'Item not found' };

    const row = itemsSheet.getRange(rowIndex, 1, 1, 14).getValues()[0];
    if (String(row[7]) !== String(body.reservedBy)) {
      return { ok: false, error: 'Solo puedes cancelar tu propia reserva' };
    }
    row[6] = false;
    row[7] = '';
    itemsSheet.getRange(rowIndex, 1, 1, 14).setValues([row]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function markPurchased(body) {
  if (!body.shareCode || !body.itemId || !body.purchasedBy) {
    return { ok: false, error: 'shareCode, itemId, purchasedBy required' };
  }
  const entry = findEntry(body.shareCode);
  if (!entry) return { ok: false, error: 'Lista no encontrada' };

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const itemsSheet = SpreadsheetApp.openById(entry.spreadsheetId).getSheetByName('items');
    const rowIndex   = findItemRow(itemsSheet, body.itemId);
    if (rowIndex === -1) return { ok: false, error: 'Item not found' };

    const row = itemsSheet.getRange(rowIndex, 1, 1, 14).getValues()[0];
    row[4] = Number(row[3]);        // quantityPurchased = quantity
    row[6] = true;                  // isReserved
    row[7] = body.purchasedBy;      // reservedBy
    row[8] = true;                  // isPurchased
    row[9] = body.purchasedBy;      // purchasedBy
    itemsSheet.getRange(rowIndex, 1, 1, 14).setValues([row]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function suggestItem(body) {
  if (!body.shareCode) return { ok: false, error: 'shareCode required' };
  if (!body.name)      return { ok: false, error: 'name required' };
  if (!body.addedBy)   return { ok: false, error: 'addedBy required' };

  const entry = findEntry(body.shareCode);
  if (!entry) return { ok: false, error: 'Lista no encontrada' };

  const itemId = generateCode(10);
  const now    = new Date().toISOString();
  SpreadsheetApp.openById(entry.spreadsheetId).getSheetByName('items').appendRow([
    itemId,
    body.name,
    body.category || 'Otros',
    1,
    0,
    'low',
    false,
    '',
    false,
    '',
    '',
    body.notes    || '',
    body.addedBy,
    now,
  ]);

  return { ok: true, itemId };
}
