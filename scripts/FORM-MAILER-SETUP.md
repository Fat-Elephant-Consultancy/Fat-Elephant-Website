# Form mailer setup

The website forms post to a Google Apps Script web app, which emails `hello@fatelephant.co.in`
and logs each submission in a Google Sheet. The code is `scripts/form-mailer.gs`.

## One-time setup (sign in to Google as hello@fatelephant.co.in)

1. Go to sheets.new and name the sheet "Fat Elephant enquiries". Add a header row if you like:
   Date, Source, Subject, Email, Name, Full message.
2. In that sheet choose Extensions > Apps Script.
3. Delete the sample code, paste in all of `scripts/form-mailer.gs`, and save (name it "Form mailer").
4. In the editor pick the function `sendTest` and press Run. Google asks for permission:
   Review permissions > choose the account > Advanced > "Go to Form mailer (unsafe)" > Allow.
   (It says unsafe only because the script is your own and not reviewed by Google.)
   A test email should arrive in the hello@ inbox within a minute.
5. Deploy > New deployment > type "Web app".
   - Execute as: Me
   - Who has access: Anyone
   Press Deploy and copy the Web app URL (it ends in /exec).
6. Give that URL to whoever maintains the site. It goes in `FORM_ENDPOINT` in `js/main.js`.

## Changing the script later

Editing the code does not change the live app. Use Deploy > Manage deployments > pencil icon >
Version: New version > Deploy. The URL stays the same.

## If mail stops arriving

- Open the Sheet: every submission is logged there, even if the email did not arrive.
- Apps Script editor > Executions shows errors for each request.
- Check the Spam folder of hello@.
