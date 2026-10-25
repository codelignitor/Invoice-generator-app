"use client";
import { readFile } from "@/lib/invoice";

const inp =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const fileInp =
  "block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:text-slate-700 hover:file:bg-slate-200";

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 border-b border-slate-200 pb-1 text-sm font-semibold text-blue-600">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export default function InvoiceForm({ data, setData, onPdf, onPrint, onReset, busy, msg }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  const text = (k, props = {}) => <input className={inp} value={data[k]} onChange={set(k)} {...props} />;

  const setItem = (id, k, v) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, [k]: v } : it)) }));
  const addItem = () =>
    setData((d) => ({ ...d, items: [...d.items, { id: Date.now(), d: "", a: 0, t: 0 }] }));
  const delItem = (id) => setData((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));

  const onLogo = async (e) => {
    const f = e.target.files?.[0];
    if (f) setData((d) => ({ ...d, logo: "" }));
    if (f) {
      const src = await readFile(f);
      setData((d) => ({ ...d, logo: src }));
    }
    e.target.value = "";
  };

  const onPayLogos = async (e) => {
    const files = Array.from(e.target.files || []);
    const srcs = await Promise.all(files.map(readFile));
    setData((d) => ({
      ...d,
      payLogos: [...d.payLogos, ...srcs.map((src, i) => ({ id: Date.now() + i, src }))],
    }));
    e.target.value = "";
  };
  const delPayLogo = (id) => setData((d) => ({ ...d, payLogos: d.payLogos.filter((l) => l.id !== id) }));

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
      <h1 className="text-lg font-semibold">Invoice generator</h1>
      <p className="text-xs text-slate-500">Edit the fields and the invoice updates on the right.</p>

      <Section title="Your business">
        <Field label="Logo">
          <input type="file" accept="image/*" onChange={onLogo} className={fileInp} />
          {data.logo && (
            <button className="mt-1 text-xs text-red-600" onClick={() => setData((d) => ({ ...d, logo: "" }))}>
              Remove logo
            </button>
          )}
        </Field>
        <Field label="Business name">{text("co")}</Field>
        <Field label="Address">{text("addr")}</Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Phone(s)">{text("tel")}</Field>
          <Field label="Email">{text("email")}</Field>
        </div>
      </Section>

      <Section title="Client">
        <Field label="Client name">{text("cn")}</Field>
        <Field label="Client address">{text("ca")}</Field>
      </Section>

      <Section title="Invoice">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Invoice no.">{text("no")}</Field>
          <Field label="Status">
            <select className={inp} value={data.st} onChange={set("st")}>
              <option>Un Paid</option>
              <option>Paid</option>
              <option>Partially Paid</option>
            </select>
          </Field>
          <Field label="Issue date">{text("date", { type: "date" })}</Field>
          <Field label="Billing month">{text("bm", { type: "month" })}</Field>
        </div>
        <Field label="Currency">{text("cur")}</Field>
      </Section>

      <Section title="Items">
        {data.items.map((it) => (
          <div key={it.id} className="rounded-lg border border-slate-200 p-2.5">
            <Field label="Service details">
              <input className={inp} value={it.d} onChange={(e) => setItem(it.id, "d", e.target.value)} />
            </Field>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Field label="Amount excl. tax">
                <input type="number" min="0" step="any" className={inp} value={it.a}
                  onChange={(e) => setItem(it.id, "a", e.target.value)} />
              </Field>
              <Field label="Tax %">
                <input type="number" min="0" step="any" className={inp} value={it.t}
                  onChange={(e) => setItem(it.id, "t", e.target.value)} />
              </Field>
            </div>
            {data.items.length > 1 && (
              <button className="mt-2 text-xs text-red-600" onClick={() => delItem(it.id)}>
                Remove item
              </button>
            )}
          </div>
        ))}
        <button onClick={addItem} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          Add item
        </button>
      </Section>

      <Section title="Note and payment">
        <Field label="Note">
          <textarea className={`${inp} min-h-[50px]`} value={data.note} onChange={set("note")} />
        </Field>
        <Field label="Payment instructions">
          <textarea className={`${inp} min-h-[60px]`} value={data.pay} onChange={set("pay")} />
        </Field>
        <Field label="Billing contact text">
          <textarea className={`${inp} min-h-[60px]`} value={data.bill} onChange={set("bill")} />
        </Field>
        <Field label="Payment method logos">
          <input type="file" accept="image/*" multiple onChange={onPayLogos} className={fileInp} />
        </Field>
        {data.payLogos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.payLogos.map((l) => (
              <div key={l.id} className="relative rounded-md border border-slate-200 p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.src} alt="" className="h-8 max-w-[90px] object-contain" />
                <button
                  onClick={() => delPayLogo(l.id)}
                  aria-label="Remove logo"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-red-600 text-xs leading-5 text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={onPdf} disabled={busy}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? "Preparing…" : "Download PDF"}
        </button>
        <button onClick={onPrint} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
          Print
        </button>
        <button onClick={onReset} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
          Reset
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-red-600">{msg}</p>}
    </aside>
  );
}
