import * as admin from 'firebase-admin'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { google } from 'googleapis'

interface ListItem {
  name: string
  category: string
  quantity: number
  quantityPurchased: number
  reservedBy: string | null
  purchasedBy: string | null
  priority: string
  notes: string
  addedBy: string
  createdAt: admin.firestore.Timestamp
}

/**
 * Called whenever an item is created, updated, or deleted.
 * Does a full rewrite of the sheet data rows.
 */
export const onItemWrite = onDocumentWritten(
  'lists/{listId}/items/{itemId}',
  async (event) => {
    const listId = event.params.listId

    const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON
    if (!serviceAccountJson) {
      logger.warn('SERVICE_ACCOUNT_JSON not set — skipping Sheets sync')
      return
    }

    try {
      // Fetch parent list for the sheet ID
      const listSnap = await admin.firestore().collection('lists').doc(listId).get()
      if (!listSnap.exists) return

      const listData = listSnap.data()
      const googleSheetId = listData?.googleSheetId as string | undefined
      if (!googleSheetId) {
        logger.info(`List ${listId} has no googleSheetId yet — skipping sync`)
        return
      }

      // Fetch all items
      const itemsSnap = await admin
        .firestore()
        .collection('lists')
        .doc(listId)
        .collection('items')
        .orderBy('createdAt', 'asc')
        .get()

      const rows = itemsSnap.docs.map((doc) => {
        const item = doc.data() as ListItem
        const dateAdded = item.createdAt
          ? item.createdAt.toDate().toLocaleDateString('es-MX')
          : ''
        return [
          item.name,
          item.category,
          item.quantity,
          item.quantityPurchased,
          item.reservedBy ?? '',
          item.purchasedBy ?? '',
          item.priority,
          item.notes,
          item.addedBy,
          dateAdded,
        ]
      })

      const serviceAccount = JSON.parse(serviceAccountJson)
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })
      const sheets = google.sheets({ version: 'v4', auth })

      // Clear existing data rows
      await sheets.spreadsheets.values.clear({
        spreadsheetId: googleSheetId,
        range: 'Sheet1!A2:Z',
      })

      if (rows.length > 0) {
        // Write all rows starting at A2
        await sheets.spreadsheets.values.update({
          spreadsheetId: googleSheetId,
          range: 'Sheet1!A2',
          valueInputOption: 'RAW',
          requestBody: { values: rows },
        })
      }

      logger.info(`Synced ${rows.length} items to sheet ${googleSheetId}`)
    } catch (err) {
      logger.error('Failed to sync items to Google Sheet:', err)
      // Don't throw — item writes should still succeed
    }
  }
)
