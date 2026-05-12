# Security Policy 🛡️

## Reporting a Vulnerability

If you discover a security vulnerability within Zorix, we appreciate your help in disclosing it to us in a responsible manner.

**Please do not report security vulnerabilities via public GitHub issues.**

Instead, please send an email to **asifhossin867@gmail.com**

### What to include in your report:

- A detailed description of the vulnerability.
- Steps to reproduce the issue (PoC code is highly appreciated).
- Potential impact of the vulnerability.

## Security Best Practices in Zorix

Zorix is designed to be a thin, secure wrapper around IndexedDB.

- **No Data Egress**: Zorix never sends your data to any external server. Everything stays in the browser.
- **Sanitization**: We perform basic schema validation, but we recommend sanitizing user input before saving to the database to prevent cross-site scripting (XSS) if you plan to render that data later.
- **Encryption**: Zorix does not provide built-in encryption. If you need to store sensitive data (like passwords or PII), please encrypt it before passing it to Zorix.
