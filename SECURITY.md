# Public storefront and protected products

Everything committed here, including earlier versions, must be treated as public.
GitHub Pages serves static files; it cannot keep a paid asset or a browser-side
secret private. Removing a link, hiding a button, or checking a browser flag does
not protect a downloadable file.

| Item | Where it belongs |
| --- | --- |
| Landing page, product descriptions, public creator name | This public repository |
| Free Starter Guide | This public repository, intentionally available to anyone |
| Paid PDFs, course videos, purchaser access | Protected delivery on a sales provider or a secured backend outside this repository |
| Customer emails, orders, support messages | Private provider storage with appropriate access controls |
| Secret API keys, passwords, signing secrets | Provider/server secret storage, never HTML, JavaScript, Git, or browser storage |

Currently there is no checkout, payment processing, customer database, or active
email collection. No additional account is needed for the current free download.
Future paid functionality is not implemented or certified secure by this site.

## Before enabling sales or collecting customer data

1. Choose a provider that hosts checkout and protected digital delivery, or review
   a separate backend design. Keep card details out of this static site. Confirm
   the provider's actual delivery and access protections before choosing it.
2. Verify payment and entitlement at the provider/server before releasing paid
   files. A redirect, query parameter, JavaScript variable, or localStorage flag
   is not proof of purchase. If implementing webhooks, verify their signatures,
   process duplicate events safely, and check the expected order and payment.
3. Keep paid files in private storage. Authorize access before issuing short-lived
   download links where supported. Test unauthenticated/non-purchaser access,
   incorrect products, failed payments, duplicate events, refunds, and expiry.
4. Publish accurate delivery, support, refund, and privacy information for the
   real provider. Minimize collected data and provide a private deletion route.
   Disable routine signup/sales notifications to the owner, as requested.
5. Review integration changes and test them before launch. Keep accounts and
   access permissions maintained after launch. Do not put integration secrets
   into this repository, including test credentials.

Downloaded products can be copied or reshared by a purchaser. Protected delivery
limits unauthorized access at delivery; it cannot guarantee that a buyer will
never redistribute a copy. No architecture or scan guarantees total safety.

## Publication checks

`public-files.json` is the reviewed list of public source files. The only approved
download is `assets/sideline-starter-guide.pdf`. New files require explicit review;
renaming a paid file or including private data in an approved file is prohibited.

- `npm run security:check` checks the working tree, including unexpected files.
- `npm run security:check -- --staged` checks the actual index blobs being committed.
- `npm run security:check -- --history` checks all locally available Git history.
- `npm run ci:code` runs the working-tree guard, site checks, and regression tests.
- `npm run agent:sync -- --message "Describe the change"` checks all three stages.

The local pre-commit/pre-push hooks use the staged/history checks. In another
checkout, first inspect `git config --get core.hooksPath`. If no custom hook path
is set, `git config --local core.hooksPath .githooks` enables these hooks. Do not
overwrite an existing hook configuration. Hooks are local, not a server-side
enforcement guarantee; do not bypass them. GitHub's secret scanning and push
protection add checks for supported credentials.

The guard blocks unreviewed paths, private-file categories, symlinks/submodules,
unapproved downloads, and several recognizable credential formats. It never
prints matching secret values. It is not an exhaustive secret detector, content
classifier, malware scanner, access-control system, or substitute for diff review.
Historical checks require full history; a shallow checkout is rejected. The old
public `responsive-review.html` QA page is allowed in history only.

Keep `.gitignore` as a second precaution; ignored files can still be force-added
or remain tracked. Do not keep private materials in this project folder.

If a real secret is exposed, revoke/rotate it immediately and investigate usage.
Deleting the latest file does not remove past commits or copies. For personal
data or paid content exposure, restrict the source, assess the impact, and use
GitHub's documented removal process where appropriate. Never paste sensitive
details into a public issue or pull request.

## References

- [GitHub Pages static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub secret scanning and credential remediation](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning)
- [Stripe integration security guidance](https://docs.stripe.com/security/guide)
