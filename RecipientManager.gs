/**
 * RecipientManager.gs
 *
 * Manages the Recipients tab — reading, filtering, and validating
 * recipient data for the Chat DM system.
 *
 * Expected columns in "Recipients" tab:
 *   A: Name | B: Email | C: School | D: Role | E: Group | F: Active
 */

const RecipientManager = (function () {

  const SHEET_NAME = 'Recipients';

  // Column indices (0-based for array access)
  const COL = {
    NAME:   0,
    EMAIL:  1,
    SCHOOL: 2,
    ROLE:   3,
    GROUP:  4,
    ACTIVE: 5
  };

  /**
   * getRecipients
   *
   * Returns recipients from the Recipients tab, with optional filtering.
   *
   * @param {Object} [filter] - Optional filter. Any combination of:
   *   { school: string, role: string, group: string, searchText: string }
   * @returns {Array<Object>} Array of { name, email, school, role, group }
   */
  function getRecipients(filter) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    let recipients = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const name   = String(row[COL.NAME]).trim();
      const email  = String(row[COL.EMAIL]).trim();
      const school = String(row[COL.SCHOOL]).trim();
      const role   = String(row[COL.ROLE]).trim();
      const group  = String(row[COL.GROUP]).trim();
      const active = String(row[COL.ACTIVE]).trim().toUpperCase();

      // Skip empty rows or inactive recipients
      if (!email || (active && active === 'FALSE')) continue;

      const recipient = { name, email, school, role, group };

      // Apply filters
      if (filter) {
        if (filter.school && filter.school !== school) continue;
        if (filter.role && filter.role !== role) continue;
        if (filter.group && filter.group !== group) continue;
        if (filter.searchText) {
          const search = filter.searchText.toLowerCase();
          const matchesSearch = name.toLowerCase().includes(search) ||
                                email.toLowerCase().includes(search);
          if (!matchesSearch) continue;
        }
      }

      recipients.push(recipient);
    }

    // Sort alphabetically by name
    recipients.sort((a, b) => a.name.localeCompare(b.name));
    return recipients;
  }

  /**
   * getRecipientByEmail
   *
   * Finds a single recipient by email.
   *
   * @param {string} email
   * @returns {Object|null}
   */
  function getRecipientByEmail(email) {
    const all = getRecipients();
    return all.find(r => r.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * getFilterOptions
   *
   * Returns distinct schools, roles, and groups for filter dropdowns.
   *
   * @returns {{ schools: string[], roles: string[], groups: string[] }}
   */
  function getFilterOptions() {
    const all = getRecipients();
    const schools = new Set();
    const roles = new Set();
    const groups = new Set();

    all.forEach(r => {
      if (r.school) schools.add(r.school);
      if (r.role) roles.add(r.role);
      if (r.group) groups.add(r.group);
    });

    return {
      schools: [...schools].sort(),
      roles: [...roles].sort(),
      groups: [...groups].sort()
    };
  }

  /**
   * validateRecipients
   *
   * Checks for common issues in the Recipients tab.
   *
   * @returns {{ valid: number, invalid: number, issues: string[] }}
   */
  function validateRecipients() {
    const all = getRecipients();
    const issues = [];
    let valid = 0;
    let invalid = 0;

    const seen = new Set();

    all.forEach(r => {
      // Check for valid email format
      if (!r.email || !r.email.includes('@')) {
        issues.push(`Row for "${r.name}": Invalid email "${r.email}"`);
        invalid++;
        return;
      }

      // Check for duplicates
      if (seen.has(r.email.toLowerCase())) {
        issues.push(`Duplicate email: ${r.email}`);
        invalid++;
        return;
      }
      seen.add(r.email.toLowerCase());

      // Check for missing name
      if (!r.name) {
        issues.push(`Missing name for email: ${r.email}`);
      }

      valid++;
    });

    return { valid, invalid, issues };
  }

  // Public API
  return {
    getRecipients: getRecipients,
    getRecipientByEmail: getRecipientByEmail,
    getFilterOptions: getFilterOptions,
    validateRecipients: validateRecipients
  };

})();
