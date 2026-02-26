import * as admin from 'firebase-admin'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { google } from 'googleapis'

/**
 * Called when a new list document is created in Firestore.
 * Creates a Google Sheet for the list and stores the sheet ID back.
 */
export const onListCreate = onDocumentCreated('lists/{listId}', async (event) => {
  const listId = event.params.listId
  const data = event.data?.data()
  if (!data) return

  const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    logger.warn('SERVICE_ACCOUNT_JSON not set — skipping Sheets creation')
    return
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson)
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Create the spreadsheet
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: `${data.title} — Baby List` },
      },
    })

    const spreadsheetId = createRes.data.spreadsheetId
    if (!spreadsheetId) throw new Error('No spreadsheetId returned')

    // Write header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1:J1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Item', 'Categoría', 'Cantidad', 'Cantidad Comprada',
          'Reservado por', 'Comprado por', 'Prioridad',
          'Notas', 'Añadido por', 'Fecha añadido',
        ]],
      },
    })

    // Store spreadsheetId back in Firestore
    await admin.firestore().collection('lists').doc(listId).update({
      googleSheetId: spreadsheetId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    logger.info(`Created Google Sheet ${spreadsheetId} for list ${listId}`)
  } catch (err) {
    logger.error('Failed to create Google Sheet:', err)
    // Don't throw — list creation should still succeed
  }
})
