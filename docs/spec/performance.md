---
owner: docs/spec/performance.md
authority: canonical
status: active
answers: ["What is the performance strategy?", "Which costs require review?"]
---
# Performance

Performance is structural: static HTML, near-zero first-party JavaScript where possible, optimized responsive images, compact CSS, minimal dependencies, system or self-hosted fonts, and individually reviewed external requests.

Test against a mid-range Android device and mobile connection, not only a high-end desktop. Large scripts, new font families, third-party embeds, and expensive motion require explicit benefit and fallback analysis.
