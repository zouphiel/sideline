# Sideline maintenance

This standalone repository publishes to GitHub Pages from `main`. It is separate
from Agency/Violead. Read [SECURITY.md](SECURITY.md) before changing publication,
email collection, accounts, downloads, or payments.

- The whole repository and its Git history are public. Keep only deliberately
  public storefront files here. The Starter Guide is intentionally free/public.
- Never add paid PDFs/videos, customer or order data, credentials, private email
  addresses, keys, cookies, backups, or private configuration, even temporarily.
- Future sales must use provider-hosted checkout and protected delivery outside
  this repository, or a separately secured backend. A hidden link, JavaScript
  flag, localStorage value, or success-page URL is not payment verification.
- Keep payment secrets and entitlement checks on the provider/server. Custom
  fulfillment must authenticate payment events and check the product, amount,
  currency, and payment status before granting access. Test unauthorized access,
  failed payments, duplicate events, refunds, and expired access as applicable.
- Review each new integration before release. Do not claim future features are
  secure before implementing and testing them. No system is guaranteed risk-free.
- Preserve the current preference: no new service accounts or activated signup,
  email delivery, checkout, or payments until explicitly requested. Keep routine
  owner signup and sales alerts off when those features are eventually enabled.
- Keep the plain Sideline wordmark in the header/footer and product-led copy
  elsewhere. Use an original Duolingo/Brilliant-inspired flat 2D green/gold
  direction with geometric tiles and chunky rounded buttons. No autoplay
  animation or pause controls. Preserve mobile accessibility, reduced-motion
  support for hover transitions, and honest launching-soon course copy.
- Update `public-files.json` only for reviewed public files. Do not weaken a
  guard or bypass a hook just to publish a failed check. A passing scan cannot
  determine whether arbitrary prose or a replacement free PDF contains private
  material; review the actual diff too.

After changes, run `npm run ci:code`, review the diff, then
`npm run agent:sync -- --message "Describe the change"`. It checks working files,
staged blobs, and history before pushing this repo's `main`, without force-push.
Local Git hooks also check commits/pushes when `core.hooksPath` is `.githooks`.
Preserve any existing custom hooks when setting up another checkout.

## Owner-authorized private Roblox workspace

The owner keeps a separate local-only game repository in `roblox/` beneath
this directory. It is an explicit exception to the filesystem-only rule above,
not part of this public repository. Keep the anchored `/roblox/` ignore rule.
Never add, force-add, copy, upload, publish, or stage it as a Git submodule.
Public-file policy rejects its paths even if someone edits the public manifest.
Worktree checks accept it only as an ignored, real standalone repository.
Its own AGENTS.md governs work inside it; never run this site's sync there.
Only deliberately public safeguard changes may enter this site's history.
