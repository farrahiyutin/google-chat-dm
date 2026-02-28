/**
 * SendLogger.gs
 *
 * Logs all sent messages to the "Send Log" tab for tracking and auditing.
 */

const SendLogger = (function () {

  const SHEET_NAME = 'Send Log';

  /**
   * logSend
   *
   * Appends a row to the Send Log tab.
   *
   * @param {Object} recipient - { name, email }
   * @param {string} message   - The message text.
   * @param {string} status    - "Sent" or "Failed: <reason>"
   * @param {string} sentBy    - Email of the sender.
   */
  function logSend(recipient, message, status, sentBy) {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) return;

      const timestamp = Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd HH:mm:ss'
      );

      // Truncate message for preview (max 200 chars)
      const preview = message.length > 200
        ? message.substring(0, 200) + '…'
        : message;

      sheet.appendRow([
        timestamp,
        recipient.name || '',
        recipient.email || '',
        preview,
        status,
        sentBy
      ]);

      // Colour code the status cell
      const lastRow = sheet.getLastRow();
      const statusCell = sheet.getRange(lastRow, 5);
      if (status === 'Sent') {
        statusCell.setBackground('#e8f5e9').setFontColor('#2e7d32'); // Green
      } else if (status.startsWith('Failed')) {
        statusCell.setBackground('#ffebee').setFontColor('#c62828'); // Red
      }
    } catch (e) {
      console.error('SendLogger.logSend error:', e);
    }
  }

  /**
   * getRecentLogs
   *
   * Returns the most recent N log entries.
   *
   * @param {number} [count=50] - Number of recent logs to return.
   * @returns {Array<Object>}
   */
  function getRecentLogs(count) {
    count = count || 50;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    const startRow = Math.max(2, lastRow - count + 1);
    const numRows = lastRow - startRow + 1;
    const data = sheet.getRange(startRow, 1, numRows, 6).getValues();

    return data.reverse().map(row => ({
      timestamp: row[0],
      name: row[1],
      email: row[2],
      preview: row[3],
      status: row[4],
      sentBy: row[5]
    }));
  }

  // Public API
  return {
    logSend: logSend,
    getRecentLogs: getRecentLogs
  };

})();
