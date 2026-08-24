---
owner: docs/spec/forms.md
authority: canonical
status: active
answers: ["How do forms work by default?", "What data may forms collect?"]
---
# Forms

The optional contact form is implemented behind `features.contactForm`. It uses semantic HTML submission through Netlify Forms, a provider-recognized hidden form name, a honeypot, and a redirect to the explicitly non-indexable thank-you route. It requires no JavaScript.

The implemented fields are name, email, and a general message. Labels, native required/email validation, autocomplete, bounded lengths, a privacy link, and a warning against sensitive data are present. The provider honeypot remains a successful form control while being removed from keyboard and assistive navigation. Provider-side receipt, spam behavior, retention, deletion, and failure handling remain deployment-specific checks and are not locally production-verified.
