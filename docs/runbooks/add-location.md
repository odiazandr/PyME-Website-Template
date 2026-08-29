---
owner: docs/runbooks/add-location.md
authority: canonical
status: active
answers: ["How is a business location added?"]
---
# Add a location

Verify address, region, postal code, phone, hours, map URL, and coordinates when used. Add one stable location ID, set `approvedForPublication` once a person has confirmed the address and hours, run `npm run validate:data` and `npm run quality`, then review contact displays, directions, structured data, and multi-location UX. A published location must be open at least one day of the week.

Every field here must be supplied by the business. Postal code and locality in particular look inferable from a neighbouring record or from general knowledge of the region; they are not. An adversarial probe on 2026-08-27 watched an agent write a plausible postal code it had never been given, disclose the inference, and leave the record for review — which is the designed behaviour, but a reviewer confirming a pre-filled value is doing recognition rather than recall. If a value was not supplied, leave it out and ask.

Automated validation cannot tell a verified fact from a plausible invention. `approvedForPublication` is the only control that can, and it is an attestation by a person.
