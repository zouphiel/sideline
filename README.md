# Sideline

A buildless static landing page for digital educational products, created by **Zouphiel**. The chosen public identity is **Sideline / Zouphiel**. The site deliberately does not publish a country, personal email address, or invented business details.

Live: https://zouphiel.github.io/sideline/

Repository: https://github.com/zouphiel/sideline

Local folder: C:\Users\Helium\Nextcloud\Sideline — beside Agency.

## Visual direction and operating preferences

- Plain **Sideline** text for the name; no emblem, lettermark, or pictorial favicon.
- Flat, original 2D cartoon artwork, forest green and warm gold, open spacing, and rounded buttons.
- Gentle decorative motion with a pause control. Reduced-motion preferences disable animation automatically.
- No additional service accounts are to be created or connected at this stage.
- The free guide stays available as a direct download. Email collection and automated email delivery remain deferred.
- Do not add routine owner alerts for signups or sales. Any future email provider must support automatic customer delivery with owner alerts disabled.

## What is live

- A finished introductory Starter Guide, downloadable as a free three-page PDF without signup or login.
- A description of the planned 4-in-1 course, clearly labelled launching soon. No checkout, payments, or pre-orders.
- About information identifying Zouphiel as the independent creator.
- Public creator and product-question links on GitHub. Questions posted there are public; no private data should be included.
- Privacy, Terms, and Disclaimer pages describing the current website accurately.
- Optional Formspree signup code retained in the source, hidden and disabled while unconnected. The website sends no signup data in this state.

There is no install or build step to view or publish the site. HTML, CSS, JavaScript, and the PDF are served directly. All internal links and assets are relative to the repository root. External creator links and Formspree actions use their own HTTPS URLs.

## Email delivery is deferred

The current website works without an additional form or email-service account. Its unconnected signup forms are hidden and disabled; no email addresses are collected. Do not activate a provider or request account setup during ordinary design work.

If the owner explicitly asks to activate email delivery later, use a service that automatically sends the free PDF to the visitor and can turn off routine signup and sales alerts to the owner. An account-verification address is distinct from an address for per-signup notifications. Do not publish a private address or credentials in this public repository. Update the privacy policy, provide a working private removal route, and verify delivery before making any signup or delivery claims.

The existing Formspree placeholders are retained as inactive source scaffolding. Simply filling them in would not by itself meet the requested quiet, automatic delivery flow. No payments or checkout are active.

## Future course sales

The course card contains a commented-out FUTURE STORE LINK for a real Payhip/Gumroad URL. Only enable it when the course is ready. Before accepting payment, publish the final contents, price, delivery/access details, applicable consumer information, a genuine private support route, and your paid-product refund policy. A FUTURE REFUND POLICY comment marks the position in terms.html. The current policy correctly says that no payments are taken.

## Check and publish edits

From the Sideline folder:

    npm run ci:code
    npm run agent:sync -- --message "Describe the change"

Node/npm are optional maintenance tools, with zero dependencies to install. The code gate checks the four pages, internal links and anchors, public identity, absence of old identity placeholders, structured data, responsive CSS, JavaScript syntax, the PDF structure, and signup success/failure/inactive behavior. The sync helper stages only the known public site files and pushes this repository’s main branch without force-pushing.

GitHub Settings → Pages must remain “Deploy from a branch”, main, /(root). The .nojekyll file bypasses Jekyll processing. GitHub’s own Pages deployment job does not introduce an application build step.

In the managed identity, use the existing named Windows Git bridge for this sibling folder. Do not expose the Windows home or export credentials. The separate Agency/Violead branch and cloud settings are unrelated to this project.

## Guide references

The introductory guide links to primary sources for the platform and risk basics:

- [Roblox Creator Hub: Monetization](https://create.roblox.com/docs/production/monetization)
- [Amazon: Fulfillment by Amazon](https://sell.amazon.com/fulfillment-by-amazon)
- [FTC: Disclosures 101](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers)
- [Investor.gov: What is Risk?](https://www.investor.gov/introduction-investing/investing-basics/what-risk)

Signup reference: [Formspree HTML setup](https://formspree.io/html/).
