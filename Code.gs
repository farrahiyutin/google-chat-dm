/**
 * Code.gs
 *
 * Main entry point for the [MESSAGES] Chat DMs system.
 * Provides custom menu, trigger management, and test utilities.
 */

// =============================================================================
// MENU
// =============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💬 Chat DM')
    .addItem('📝 Compose Message', 'showComposeSidebar')
    .addSeparator()
    .addItem('📨 Send Test to Myself', 'testSendToSelf')
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Setup')
      .addItem('Setup Triggers', 'setupTriggers')
      .addItem('Remove All Triggers', 'removeAllTriggers')
      .addItem('Initialize Sheet Tabs', 'initializeSheetTabs'))
    .addToUi();
}

// =============================================================================
// SIDEBAR
// =============================================================================

/**
 * Opens the compose message sidebar.
 */
function showComposeSidebar() {
  const html = HtmlService
    .createHtmlOutputFromFile('Sidebar')
    .setTitle('Compose Chat DM')
    .setWidth(380);
  SpreadsheetApp.getUi().showSidebar(html);
}

// =============================================================================
// TRIGGERS
// =============================================================================

/**
 * Programmatically creates the scheduled-send trigger.
 */
function setupTriggers() {
  const ui = SpreadsheetApp.getUi();

  // Remove existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // 1. onOpen (simple trigger is automatic, but installable for reliability)
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onOpen()
    .create();

  // 2. Scheduled batch send — every day at 5:30 PM IST
  ScriptApp.newTrigger('processScheduledMessages')
    .timeBased()
    .everyDays(1)
    .atHour(17)
    .nearMinute(30)
    .create();

  ui.alert(
    'Triggers Created ✅',
    '1. onOpen trigger — active\n2. Scheduled send — daily at ~5:30 PM IST',
    ui.ButtonSet.OK
  );
}

/**
 * Removes all triggers associated with this project.
 */
function removeAllTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  SpreadsheetApp.getUi().alert('All triggers removed.');
}

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Sends a test DM to the currently logged-in user, to verify 
 * Chat API connectivity.
 */
function testSendToSelf() {
  const ui = SpreadsheetApp.getUi();

  // Chat API doesn't allow DM-ing yourself, so prompt for a colleague's email
  const response = ui.prompt(
    '📨 Send Test Message',
    'Enter a colleague\'s email to send a test DM to:\n(Cannot send to yourself — Chat API limitation)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const testEmail = response.getResponseText().trim();
  if (!testEmail || !testEmail.includes('@')) {
    ui.alert('Error', 'Please enter a valid email address.', ui.ButtonSet.OK);
    return;
  }

  try {
    const result = ChatDM.sendDirectMessage(
      testEmail,
      '✅ *Chat DM Test Successful!*\n\nThis is a test message from the [MESSAGES] Chat DMs system. If you see this in Google Chat, the system is working correctly.'
    );

    if (result.success) {
      ui.alert(
        'Test Passed ✅',
        'A test message was sent to ' + testEmail + '.\n\nAsk them to check their Google Chat!',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert('Test Failed ❌', 'Error: ' + result.error, ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('Test Failed ❌', 'Exception: ' + e.message, ui.ButtonSet.OK);
  }
}

// =============================================================================
// SHEET INITIALIZATION
// =============================================================================

/**
 * Creates the required tabs if they don't exist and sets up headers.
 */
function initializeSheetTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Recipients tab ---
  let recipientsSheet = ss.getSheetByName('Recipients');
  if (!recipientsSheet) {
    recipientsSheet = ss.insertSheet('Recipients');
    recipientsSheet.getRange('A1:F1').setValues([['Name', 'Email', 'School', 'Role', 'Group', 'Active']]);
    recipientsSheet.getRange('A1:F1')
      .setFontWeight('bold')
      .setBackground('#1a73e8')
      .setFontColor('#ffffff');
    recipientsSheet.setFrozenRows(1);
    recipientsSheet.setColumnWidth(1, 180);
    recipientsSheet.setColumnWidth(2, 240);
    recipientsSheet.setColumnWidth(3, 150);
    recipientsSheet.setColumnWidth(4, 100);
    recipientsSheet.setColumnWidth(5, 150);
    recipientsSheet.setColumnWidth(6, 70);
  }

  // --- Send Log tab ---
  let logSheet = ss.getSheetByName('Send Log');
  if (!logSheet) {
    logSheet = ss.insertSheet('Send Log');
    logSheet.getRange('A1:F1').setValues([['Timestamp', 'Recipient', 'Email', 'Message Preview', 'Status', 'Sent By']]);
    logSheet.getRange('A1:F1')
      .setFontWeight('bold')
      .setBackground('#34a853')
      .setFontColor('#ffffff');
    logSheet.setFrozenRows(1);
    logSheet.setColumnWidth(1, 160);
    logSheet.setColumnWidth(2, 150);
    logSheet.setColumnWidth(3, 220);
    logSheet.setColumnWidth(4, 300);
    logSheet.setColumnWidth(5, 80);
    logSheet.setColumnWidth(6, 180);
  }

  // --- Config tab ---
  let configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    configSheet.getRange('A1:B1').setValues([['Setting', 'Value']]);
    configSheet.getRange('A1:B1')
      .setFontWeight('bold')
      .setBackground('#fbbc04')
      .setFontColor('#000000');
    configSheet.setFrozenRows(1);
    
    // Default config entries
    const defaults = [
      ['School 1 Name', ''],
      ['School 2 Name', ''],
      ['School 3 Name', ''],
      ['Default Message Title', 'School Notification'],
      ['Rate Limit (messages per minute)', '30'],
      ['Enable Send Log', 'TRUE'],
    ];
    configSheet.getRange(2, 1, defaults.length, 2).setValues(defaults);
    configSheet.setColumnWidth(1, 280);
    configSheet.setColumnWidth(2, 300);
  }

  // Remove default "Sheet1" if others exist
  const sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet1);
  }

  SpreadsheetApp.getUi().alert('Sheet tabs initialized! ✅');
}

// =============================================================================
// SIDEBAR HANDLERS (called from Sidebar.html)
// =============================================================================

/**
 * Returns the list of recipients for the sidebar picker.
 * @param {Object} filter - Optional filter { school, role, group }
 * @returns {Array<Object>}
 */
function getRecipientsForSidebar(filter) {
  return RecipientManager.getRecipients(filter);
}

/**
 * Returns distinct schools, roles, and groups for the sidebar filter dropdowns.
 * @returns {Object} { schools: [], roles: [], groups: [] }
 */
function getFilterOptions() {
  return RecipientManager.getFilterOptions();
}

/**
 * Sends a message from the sidebar.
 * @param {Object} payload - { recipients: [{email, name}], message: string }
 * @returns {Object} { sent: number, failed: number, errors: [] }
 */
function sendFromSidebar(payload) {
  return MessageEngine.sendToRecipients(
    payload.recipients,
    payload.message,
    { sentBy: Session.getActiveUser().getEmail() }
  );
}

/**
 * Processes scheduled messages (called by the daily trigger).
 */
function processScheduledMessages() {
  MessageEngine.processScheduledQueue();
}
