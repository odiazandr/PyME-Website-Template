---
owner: docs/spec/forms.md
authority: canonical
status: active
answers: ["How do forms work by default?", "What data may forms collect?"]
---

# Forms

The optional contact form is implemented behind `features.contactForm`. Its provider-facing name, machine field names, notification requirement, and intake class are owned by `src/config/forms.ts`; labels remain localized in `ContactForm.astro`. It uses semantic HTML submission through Netlify Forms, a provider-recognized hidden form name, a honeypot, and a redirect to the explicitly non-indexable thank-you route. It requires no JavaScript.

The implemented fields are name, email, and a general message. Labels, native required/email validation, autocomplete, bounded lengths, a privacy link, and a warning against sensitive data are present. The provider honeypot remains a successful form control while being removed from keyboard and assistive navigation. Provider-side receipt, spam behavior, retention, deletion, and failure handling remain deployment-specific checks and are not locally production-verified.

## Intake boundary

`basic_contact` allows only name, email, phone, and a short message. `appointment_request` additionally allows lightweight scheduling fields. `restricted` data cannot be declared for a static-provider form: medical histories, payment data, identity documents, file uploads, and other sensitive intake require an architecture review and an approved backend or CRM design.

## Evidence states

Form evidence is not one claim. `verify:deployment` reports each enabled form independently as rendered locally, registered by the provider, having a stored verified submission, and having a configured notification hook. Inbox receipt and provider retention/deletion practice remain manual evidence; they must not be inferred from a hook or submission count.
