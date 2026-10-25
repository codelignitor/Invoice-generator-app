# Invoice Generator (Next.js + Tailwind CSS, JavaScript)

Form on the left, live A4 invoice preview on the right. Export as PDF or print.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Production: `npm run build && npm start`

## Structure

- `app/page.js` – state, autosave (localStorage), PDF export
- `components/InvoiceForm.js` – all inputs, logo and payment-logo uploads
- `components/InvoicePreview.js` – the invoice layout (edit this to change the look)
- `lib/invoice.js` – defaults, totals, formatting helpers
