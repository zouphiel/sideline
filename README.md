# Sideline

A mobile-first, buildless website for an independent freelancer's digital educational products. Plain HTML, CSS, and JavaScript; system fonts; no frameworks, third-party scripts, checkout, or server. GitHub Pages serves the files directly from `main` at the repository root.

Live address: https://zouphiel.github.io/sideline/

Local folder: `C:\Users\Helium\Nextcloud\Sideline` (beside `Agency`, never inside it).

## Before business verification

The current site is an honest draft with explicitly missing business details. It is **not ready for bank verification** until these are completed. A public nickname may be suitable for the website, but check your bank's identity requirements.

1. The public owner name is **Zouphiel**, matching the GitHub handle and the preference for a nickname. Replace it in all four HTML files if you prefer another public name. Your bank may require a legal name; confirm its requirements before verification.
2. Replace `OWNER_COUNTRY` with the real country in all four HTML files.
3. Replace `CONTACT_EMAIL` with a real monitored email in all four HTML files, including the Organization JSON-LD in `index.html`. In the Contact section, replace the placeholder `<span>` with `<a href="mailto:YOUR_REAL_EMAIL">YOUR_REAL_EMAIL</a>` and remove the contact setup note. Do not invent a registered company name or registration number.
4. Review the policies against the actual way you run the business.
5. Replace `assets/sideline-starter-guide.pdf` with the finished free guide when ready. The current PDF is a real one-page placeholder edition and is labelled as such on the site. Remove the placeholder wording when the finished guide replaces it.
6. The course stays **launching soon**. No price, checkout, delivery date, or completed course is claimed.

## Connect the free email signup

1. Open https://formspree.io/ and create a free account, or sign in to your existing account. Verify the recipient email.
2. Choose **New Form** and create a Sideline signup form. Copy its endpoint, which looks like `https://formspree.io/f/abcdefgh`.
3. In **index.html**, find the two occurrences of `action="https://formspree.io/f/YOUR_FORM_ID"`: one on `<form id="guide-form">`, one on `<form id="waitlist-form">`. Replace each full action value with your real endpoint. There are clearly marked `FORMSPREE SETUP` comments immediately above them. You may use one endpoint for both, or separate forms. The hidden `signup_type` field identifies which request was made.
4. Save and commit to `main`. The setup notices hide automatically once the endpoint has a valid Formspree shape. The guide link only appears after Formspree confirms success. A placeholder endpoint never sends or saves an address. Do not add API keys or tokens.
5. Test each form using an email address you control. Check that the submission arrives in your Formspree dashboard/inbox; check the PDF download and waitlist confirmation. Test failure with your browser offline too. These live provider tests have not been performed with an owner endpoint yet.
6. **Email delivery is manual on the free plan.** Formspree collects the request and notifies you; this website does not automatically send the PDF to the subscriber. Reply to each guide request with the PDF/link, and email only those who explicitly join the waitlist about the course launch. Never expose your subscriber list. Formspree's free plan currently allows 50 submissions a month; automatic subscriber responses require a paid plan and are not used here. No paid service is required for manual delivery.
7. If Formspree requires an interactive CAPTCHA, follow its current dashboard guidance for AJAX submissions and test the real configuration. The site will show an error rather than falsely confirm an unaccepted submission. Configure available spam protection and domain restrictions in Formspree. The `_gotcha` field is supplementary, not a guarantee against spam.

PDF files on a static public website are publicly reachable. Hiding the link until signup is a convenience, not access control.

## Future paid products

There is a commented-out `FUTURE STORE LINK` in the course card in `index.html`. Only enable it when the course is ready, with your actual Payhip/Gumroad store URL. First replace the clearly marked refund policy placeholder in `terms.html`, and publish the final course contents, price, delivery terms, and relevant consumer information. No payment integration exists now.

## Edit and deploy

No install, build, or Node runtime is needed to view or host the website. Edit the HTML/CSS/JS files directly. All internal links and assets use relative paths so the `/sideline/` project subdirectory works. The Formspree endpoint is intentionally an absolute external HTTPS URL.

GitHub repository: https://github.com/zouphiel/sideline

GitHub **Settings → Pages → Build and deployment**: select **Deploy from a branch**, **main**, **/(root)**, then **Save**. `.nojekyll` bypasses Jekyll processing. GitHub may still show its own Pages deployment job; there is no application build step.

For future edits, from the Sideline folder:

```sh
npm run ci:code
npm run agent:sync -- --message "Describe the change"
```

Node/npm are optional development checks only, with zero dependencies to install. The code gate checks page structure, local links/anchors, structured data, JavaScript syntax, responsive CSS, the PDF, and eight signup behavior cases using mocked network responses. The sync helper restricts staging to the known public site files and pushes only this standalone `sideline` repository's `main` branch. It never force-pushes. Windows Git may be used through `wgit` in the managed identity; ordinary local use runs `git`.

When the managed identity cannot see the sibling folder, use the documented Windows named-tool bridge for Git operations. Do not expose the Windows home or copy credentials into Linux. The separate Agency/Violead branch and cloud settings are unrelated to this standalone website.

## References

- [Formspree HTML form setup](https://formspree.io/html/)
- [Formspree plan limits and email response features](https://formspree.io/plans)
- [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
