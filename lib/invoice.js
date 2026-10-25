export function makeDefault() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    logo: "",
    co: "Your Business",
    addr: "Street, City, Country.",
    tel: "Tel: +00-000-0000000",
    email: "you@example.com",
    cn: "Client Name",
    ca: "City, Country",
    no: "CB-00000001",
    st: "Un Paid",
    date: today,
    bm: today.slice(0, 7),
    cur: "USD",
    items: [{ id: 1, d: " Services", a: 0, t: 0 }],
    note: "",
    pay: "Please make all payments in favor of\nAccount Title: Your Name : Account No 0000000000, Bank Name: Your Bank",
    bill: "Head Office: Street, City, Country.\nTel: +00-000-0000000 | Email: you@example.com",
    payLogos: [], // [{ id, src }]
  };
}

export const fmt = (n) =>
  (Math.round((Number(n) || 0) * 100) / 100).toLocaleString("en-US");

export function fmtDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00")
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, "-");
}

export function fmtMonth(m) {
  if (!m) return "";
  return new Date(m + "-01T00:00:00")
    .toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    .replace(" ", "-");
}

export function calc(items) {
  let sub = 0, tax = 0;
  const rows = items.map((it) => {
    const a = Number(it.a) || 0;
    const t = Number(it.t) || 0;
    const ta = (a * t) / 100;
    sub += a;
    tax += ta;
    return { ...it, a, t, ta, inc: a + ta };
  });
  return { rows, sub, tax, total: sub + tax };
}

export const readFile = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
