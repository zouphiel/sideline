# Sideline

A buildless static landing page for digital educational products, created by **Zouphiel**. The chosen public identity is **Sideline / Zouphiel**. The site deliberately does not publish a country, personal email address, or invented business details.

Live: https://zouphiel.github.io/sideline/

Repository: https://github.com/zouphiel/sideline

Local folder: C:\Users\Helium\Nextcloud\Sideline — beside Agency.

## What is live

- A finished introductory Starter Guide, downloadable as a free three-page PDF without signup or login.
- A description of the planned 4-in-1 course, clearly labelled launching soon. No checkout, payments, or pre-orders.
- About information identifying Zouphiel as the independent creator.
- Public creator and product-question links on GitHub. Questions posted there are public; no private data should be included.
- Privacy, Terms, and Disclaimer pages describing the current website accurately.
- Optional Formspree signup code retained in the source, hidden and disabled while unconnected. The website sends no signup data in this state.

There is no install or build step to view or publish the site. HTML, CSS, JavaScript, and the PDF are served directly. All internal links and assets are relative to the repository root. External creator links and Formspree actions use their own HTTPS URLs.

## Optional: activate email delivery and the course waitlist later

The public website and free download already work. No form endpoint is needed for them.

1. Create a free form at https://formspree.io/ and verify your recipient email with that provider. The recipient address need not appear publicly in the form action.
2. Before collecting emails, update privacy.html to describe the actual collection, uses, retention, and a working **private** method for deletion/removal requests. Do not direct subscribers to publish their addresses in GitHub issues.
3. In index.html, find the two FORMSPREE SETUP comments. Replace the full action value https://formspree.io/f/YOUR_FORM_ID on form id="guide-form" and form id="waitlist-form" with your real endpoint. Use one endpoint or separate ones; the hidden signup_type field distinguishes guide requests from waitlist requests. These public endpoint IDs are not secrets. Do not add API keys or credentials.
4. The JavaScript reveals only configured forms, removes their inactive-state notices, and changes the course button to “Join the course waitlist” when its endpoint is configured. Update the remaining “email updates coming soon” copy in the product card, FAQ, Terms, and Disclaimer at the same time. Keep the direct PDF download available.
5. Test both forms with an address you control. Confirm the submission reaches your Formspree dashboard/inbox, that the guide confirmation reveals its download link, and that waitlist submission does not imply a purchase. Test an offline/error case. No real submissions have been sent during development.
6. Email delivery is manual with this free workflow: reply to guide requests with the PDF/link and send course launch emails only to people who explicitly joined the waitlist. This website does not send automatic subscriber emails. Check the provider’s current free limits and spam settings; no paid features are required for manual delivery.

The source keeps both forms hidden and their submit buttons disabled without JavaScript. Placeholder endpoints never receive submissions. A failed or unconfirmed response cannot produce a success message. Public PDF files are not access controlled.

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
