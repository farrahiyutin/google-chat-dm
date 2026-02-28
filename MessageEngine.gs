/**
 * MessageEngine.gs
 *
 * High-level messaging logic: bulk sends, rate limiting,
 * group/school sends, and scheduled message processing.
 */

const MessageEngine = (function () {

  /**
   * sendToRecipients
   *
   * Sends a message to a list of recipients with rate limiting.
   *
   * @param {Array<Object>} recipientList - Array of { email, name }
   * @param {string} message - The message text.
   * @param {Object} [options] - Optional: { sentBy, title, useCard }
   * @returns {{ sent: number, failed: number, errors: Array<string> }}
   */
  function sendToRecipients(recipientList, message, options) {
    const opts = options || {};
    const sentBy = opts.sentBy || Session.getActiveUser().getEmail();
    const rateLimit = getRateLimit_();
    const results = { sent: 0, failed: 0, errors: [] };

    for (let i = 0; i < recipientList.length; i++) {
      const recipient = recipientList[i];

      // Rate limiting
      if (i > 0 && i % rateLimit === 0) {
        Utilities.sleep(60000); // Wait 1 minute
      }

      let result;
      if (opts.useCard) {
        result = ChatDM.sendCardMessage(
          recipient.email,
          message,
          opts.title || 'School Notification',
          opts.subtitle || ''
        );
      } else {
        result = ChatDM.sendDirectMessage(recipient.email, message);
      }

      if (result.success) {
        results.sent++;
        SendLogger.logSend(recipient, message, 'Sent', sentBy);
      } else {
        results.failed++;
        results.errors.push(`${recipient.name} (${recipient.email}): ${result.error}`);
        SendLogger.logSend(recipient, message, 'Failed: ' + result.error, sentBy);
      }
    }

    return results;
  }

  /**
   * sendToGroup
   *
   * Sends a message to all recipients in a specific group.
   *
   * @param {string} groupName
   * @param {string} message
   * @param {Object} [options]
   * @returns {{ sent: number, failed: number, errors: Array<string> }}
   */
  function sendToGroup(groupName, message, options) {
    const recipients = RecipientManager.getRecipients({ group: groupName });
    if (recipients.length === 0) {
      return { sent: 0, failed: 0, errors: ['No recipients found in group: ' + groupName] };
    }
    return sendToRecipients(recipients, message, options);
  }

  /**
   * sendToSchool
   *
   * Sends a message to all recipients at a specific school.
   *
   * @param {string} schoolName
   * @param {string} message
   * @param {Object} [options]
   * @returns {{ sent: number, failed: number, errors: Array<string> }}
   */
  function sendToSchool(schoolName, message, options) {
    const recipients = RecipientManager.getRecipients({ school: schoolName });
    if (recipients.length === 0) {
      return { sent: 0, failed: 0, errors: ['No recipients found at school: ' + schoolName] };
    }
    return sendToRecipients(recipients, message, options);
  }

  /**
   * processScheduledQueue
   *
   * Called by the daily trigger. Processes any messages in the
   * Compose tab marked "Send EOD" that haven't been sent yet.
   * (Future enhancement — for now, all sends are immediate from sidebar.)
   */
  function processScheduledQueue() {
    // Placeholder for future scheduled message support.
    // Currently, all messages are sent immediately from the sidebar.
    console.log('processScheduledQueue: No scheduled messages to process.');
  }

  /**
   * getRateLimit_ (Private)
   *
   * Reads the rate limit from the Config tab.
   * Default: 30 messages per minute.
   */
  function getRateLimit_() {
    try {
      const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
      if (!configSheet) return 30;

      const data = configSheet.getDataRange().getValues();
      for (let i = 0; i < data.length; i++) {
        if (String(data[i][0]).trim() === 'Rate Limit (messages per minute)') {
          const val = parseInt(data[i][1], 10);
          return isNaN(val) ? 30 : val;
        }
      }
    } catch (e) {
      console.error('Error reading rate limit:', e);
    }
    return 30;
  }

  // Public API
  return {
    sendToRecipients: sendToRecipients,
    sendToGroup: sendToGroup,
    sendToSchool: sendToSchool,
    processScheduledQueue: processScheduledQueue
  };

})();
