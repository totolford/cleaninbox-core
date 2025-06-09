// test.js
// Tests unitaires pour cleaninbox-core (exemple basique)

const { authenticateUser } = require('./src/auth/oauth');
const { listEmails } = require('./src/mail/apiGmail');
const { analyzeEmail } = require('./src/mail/mailParser');
const { cleanEmails } = require('./src/cleaning/cleaner');

describe('CleanInbox Core Tests', () => {

  test('Authenticate user with valid credentials', async () => {
    const fakeToken = 'valid_fake_token';
    const result = await authenticateUser(fakeToken);
    expect(result).toHaveProperty('accessToken');
    expect(result.accessToken).toBeTruthy();
  });

  test('List emails from mailbox', async () => {
    const fakeToken = 'valid_fake_token';
    const emails = await listEmails(fakeToken, { maxResults: 5 });
    expect(Array.isArray(emails)).toBe(true);
    expect(emails.length).toBeLessThanOrEqual(5);
    emails.forEach(email => {
      expect(email).toHaveProperty('id');
      expect(email).toHaveProperty('snippet');
    });
  });

  test('Analyze email content for unsubscribe link', () => {
    const sampleEmail = {
      subject: "Weekly Newsletter",
      body: "<html><body>Click <a href='http://unsubscribe.example.com'>here</a> to unsubscribe</body></html>"
    };
    const unsubscribeUrl = analyzeEmail(sampleEmail);
    expect(typeof unsubscribeUrl).toBe('string');
    expect(unsubscribeUrl).toContain('unsubscribe');
  });

  test('Clean emails according to filter rules', () => {
    const emails = [
      { id: '1', subject: 'Sale Newsletter', category: 'newsletter' },
      { id: '2', subject: 'Important Work Mail', category: 'inbox' },
      { id: '3', subject: 'Spam Offer', category: 'spam' }
    ];
    const cleaned = cleanEmails(emails, { removeCategories: ['newsletter', 'spam'] });
    expect(cleaned.length).toBe(1);
    expect(cleaned[0].category).toBe('inbox');
  });

});
