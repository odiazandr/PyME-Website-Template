---
owner: docs/spec/forms.md
authority: canonical
status: active
answers: ["How do forms work by default?", "What data may forms collect?"]
---
# Forms

Forms are optional and progressively enhanced. The default implementation, when needed, uses semantic HTML submission through Netlify Forms and redirects to an explicit thank-you route without requiring JavaScript.

Default fields are limited to identity, a contact method, and a message when justified. Avoid soliciting medical, financial, or otherwise sensitive detail through generic contact forms. Adding a form requires privacy, retention, validation, spam, error-state, accessibility, and failure-path review.
