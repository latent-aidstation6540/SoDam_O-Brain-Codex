# O-Brain Legal, Copyright, License, and Commercial-Use Guide

[한국어](./LEGAL_GUIDE.md) · [LICENSE](./LICENSE) · [NOTICE](./NOTICE) · [Third-party inventory](./THIRD_PARTY_LICENSES.md)

> Reviewed on 2026-09-16. This document explains verified project facts and is not legal advice. Contracts, trademarks, personal data, regulated use, and binary redistribution **require legal/professional review**.

## 1. Verified baseline

- Project license: **Apache License, Version 2.0** (SPDX: `Apache-2.0`)
- Copyright: **Copyright 2026 SoDam AI Studio**
- Official license text: `LICENSE`
- Project and direct-dependency notices: `NOTICE`
- Full lockfile inventory: `THIRD_PARTY_LICENSES.md`
- The root and distributable plugin contain matching `LICENSE`, `NOTICE`, and inventory files.
- Apache License 2.0 is the current 2.0 version published by the Apache Software Foundation.

## 2. What uses are allowed?

| Use | Current assessment | Conditions |
|---|---|---|
| Personal, educational, internal company use | Allowed | Follow applicable law and external service terms |
| Copying, forks, modification | Allowed | Keep LICENSE/copyright notices and mark changed files |
| Source redistribution | Allowed | Provide LICENSE, NOTICE, and third-party notices |
| Sale and paid support | Allowed | Separately satisfy third-party, tax, consumer, and contract duties |
| Web-service operation | Allowed | Separately satisfy privacy, security, and OpenAI/Codex terms |
| Company or client delivery | Conditional | Legal/professional review of actual deliverables and contract |
| Redistribution of `node_modules`, installers, or executables | Conditional | Review sharp/libvips LGPL duties for exact platform artifacts |

Apache-2.0 does not prohibit commercial use, but it does not guarantee rights in third-party components, input data, AI output, trademarks, or external services.

## 3. Redistribution obligations

1. Include `LICENSE`, `NOTICE`, and `THIRD_PARTY_LICENSES.md`.
2. Prominently mark files you changed.
3. Preserve applicable copyright, patent, trademark, and attribution notices.
4. Rescan exact dependencies and native binaries in the final package.
5. Offer any additional warranty, support, or indemnity only in your own name and responsibility.
6. The “AS IS,” no-warranty, and liability limits follow Sections 7 and 8 of `LICENSE`.

## 4. External components

- The lockfile has 242 package entries and zero missing license metadata fields.
- Direct dependencies use Apache-2.0, MIT, or dual licenses.
- Fourteen optional sharp/libvips platform entries contain `LGPL-3.0-or-later`.
- The all-MiniLM-L6-v2 repository identifies the model as Apache-2.0.
- Installed files vary by OS and CPU; lockfile metadata alone does not complete binary-license obligations.

## 5. Code, documentation, images, and samples

- Code and documentation may contain AI-generated or AI-assisted material. Human review of source, similarity, commercial rights, and accuracy is required before publication, sale, or delivery.
- The five current screenshots were produced from the local project dashboard and contain no PNG text metadata.
- Port numbers, `[REDACTED:api-key]`, and memory statements are synthetic. No real names, emails, customers, or working secrets were found.
- Linear, Vercel, and shadcn/ui names are dummy examples and do not imply affiliation, sponsorship, endorsement, or trademark rights.
- The project uses system fonts, project CSS, and inline symbols. Record source and commercial terms for any new image, font, icon, video, audio, or template.
- Do not ship personal databases, backups, `.env.local`, conversation logs, or customer materials.

## 6. OpenAI/Codex and AI output

O-Brain requires no dedicated paid API key, but Codex is separately governed by the user’s OpenAI account, plan, current terms, and usage policies. Consumer and business/API terms can differ; verify the current terms for the account used in distribution or client work.

AI output may be non-unique or similar to third-party material. The user must have rights to inputs and must review output accuracy, rights, privacy, trade secrets, and regulated-use suitability.

## 7. Pre-release checklist

**Must Have**

- Ship LICENSE, NOTICE, and the third-party inventory
- Rescan licenses against exact release artifacts
- Exclude secrets, personal data, customer material, and local databases
- Mark modifications and avoid trademark/affiliation confusion
- Review LGPL duties for binary delivery

**Should Have**

- Review warranty, indemnity, support, SLA, and data-processing contract terms
- Run official trademark searches for O-Brain and SoDam AI Studio
- Keep an SBOM or delivery-file manifest

**Could Have**

- Automate license policy and SBOM generation in CI
- Recheck screenshots and sample data for every release

## 8. Legal/professional review required

- Binary, installer, or container redistribution containing sharp/libvips
- Client contracts, warranty, indemnity, SLA, and data processing
- Country-specific product-name and logo trademark conflicts
- Regulated operation or processing of personal/customer data
- Individual infringement risk in AI-generated code, documents, and images

Unverified rights are not guaranteed.

## 9. Primary references

- [Official Apache License, Version 2.0 text](https://www.apache.org/licenses/LICENSE-2.0)
- [Apache Software Foundation license-application guidance](https://www.apache.org/legal/apply-license)
- [all-MiniLM-L6-v2 model LICENSE](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/main/LICENSE)
- [sharp-libvips third-party notices](https://github.com/lovell/sharp-libvips/blob/main/THIRD-PARTY-NOTICES.md)
- [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/)
- [OpenAI Business Terms](https://openai.com/policies/business-terms/)