/**
 * ChatDM.gs
 *
 * Core Google Chat API interaction layer.
 * Uses the Chat Advanced Service with USER authentication
 * (messages appear from the logged-in admin, not a bot).
 *
 * Prerequisites:
 *   1. Google Chat API enabled in GCP project
 *   2. Chat API added as Advanced Service in Apps Script
 *   3. OAuth scopes configured in appsscript.json
 */

const ChatDM = (function () {

  /**
   * sendDirectMessage
   *
   * Sends a plain-text direct message to a user by email.
   * Creates/finds the DM space automatically.
   *
   * @param {string} recipientEmail - Workspace email of the recipient.
   * @param {string} messageText   - The message body (supports Chat markup).
   * @returns {{ success: boolean, error?: string, spaceName?: string }}
   */
  function sendDirectMessage(recipientEmail, messageText) {
    try {
      // Step 1: Set up (find or create) the DM space with the recipient
      const space = setupDmSpace_(recipientEmail);
      if (!space || !space.name) {
        return { success: false, error: 'Could not create/find DM space for ' + recipientEmail };
      }

      // Step 2: Create the message in that space
      const message = Chat.Spaces.Messages.create(
        { text: messageText },
        space.name
      );

      return {
        success: true,
        spaceName: space.name,
        messageName: message.name
      };
    } catch (e) {
      console.error('ChatDM.sendDirectMessage error:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * sendCardMessage
   *
   * Sends a rich card direct message to a user by email.
   *
   * @param {string} recipientEmail - Workspace email of the recipient.
   * @param {string} messageText   - Plain text fallback.
   * @param {string} title         - Card header title.
   * @param {string} subtitle      - Card header subtitle.
   * @returns {{ success: boolean, error?: string }}
   */
  function sendCardMessage(recipientEmail, messageText, title, subtitle) {
    try {
      const space = setupDmSpace_(recipientEmail);
      if (!space || !space.name) {
        return { success: false, error: 'Could not create/find DM space for ' + recipientEmail };
      }

      const now = new Date();
      const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd MMM yyyy, hh:mm a");

      const messagePayload = {
        text: messageText, // fallback for notifications
        cardsV2: [
          {
            cardId: 'dm-card-' + now.getTime(),
            card: {
              header: {
                title: title || 'School Notification',
                subtitle: subtitle || 'Direct Message',
                imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/school/default/48px.svg',
                imageType: 'CIRCLE'
              },
              sections: [
                {
                  widgets: [
                    {
                      textParagraph: {
                        text: messageText
                      }
                    }
                  ]
                },
                {
                  widgets: [
                    {
                      textParagraph: {
                        text: '<font color="#808080">Sent on ' + dateStr + '</font>'
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      };

      const message = Chat.Spaces.Messages.create(messagePayload, space.name);

      return {
        success: true,
        spaceName: space.name,
        messageName: message.name
      };
    } catch (e) {
      console.error('ChatDM.sendCardMessage error:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * setupDmSpace_ (Private)
   *
   * Uses Chat.Spaces.setup() to create or find a DM space with the given user.
   * This is idempotent — calling it for an existing DM returns that space.
   *
   * @param {string} recipientEmail - The recipient's Workspace email.
   * @returns {Object} The Space resource.
   */
  function setupDmSpace_(recipientEmail) {
    // Chat.Spaces.setup() creates or returns an existing DM space.
    // It requires a Space object and memberships.
    const spaceSetup = Chat.Spaces.setup({
      space: {
        spaceType: 'DIRECT_MESSAGE'
      },
      memberships: [
        {
          member: {
            name: 'users/' + recipientEmail,
            type: 'HUMAN'
          }
        }
      ]
    });

    return spaceSetup;
  }

  // Public API
  return {
    sendDirectMessage: sendDirectMessage,
    sendCardMessage: sendCardMessage
  };

})();
