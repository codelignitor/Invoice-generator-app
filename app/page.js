"use client";
import { useEffect, useRef, useState } from "react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import { makeDefault } from "@/lib/invoice";

const KEY = "invoice-generator:v1";

export default function Page() {
  const [data, setData] = useState(makeDefault);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const invRef = useRef(null);
  const wrapRef = useRef(null);

  // Load saved draft
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setData({ ...makeDefault(), ...JSON.parse(s) });
    } catch {}
    setReady(true);
  }, []);

  // Save draft on every change
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      setMsg("Draft could not be saved: the uploaded images are too large for browser storage.");
    }
  }, [data, ready]);

  async function downloadPdf() {
    setBusy(true);
    setMsg("");
    const wrap = wrapRef.current;
    const prev = wrap.style.transform;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      wrap.style.transform = "none"; // capture at full size
      const canvas = await html2canvas(invRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      wrap.style.transform = prev;

      const pdf = new jsPDF("p", "pt", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pw) / canvas.width;
      const img = canvas.toDataURL("image/jpeg", 0.95);

      // Split across pages if the invoice is taller than one A4 page
      let left = imgH;
      let y = 0;
      pdf.addImage(img, "JPEG", 0, y, pw, imgH);
      left -= ph;
      while (left > 1) {
        y -= ph;
        pdf.addPage();
        pdf.addImage(img, "JPEG", 0, y, pw, imgH);
        left -= ph;
      }
      pdf.save(`Invoice-${data.no || "draft"}.pdf`);
    } catch (e) {
      wrap.style.transform = prev;
      setMsg("Could not create the PDF. Try Print and choose Save as PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (confirm("Reset all fields and remove uploaded logos?")) setData(makeDefault());
  }

  return (
  <main className="grid grid-cols-1 items-start gap-4 p-4 xl:grid-cols-2">
      <InvoiceForm
        data={data}
        setData={setData}
        onPdf={downloadPdf}
        onPrint={() => window.print()}
        onReset={reset}
        busy={busy}
        msg={msg}
      />
      <InvoicePreview data={data} invRef={invRef} wrapRef={wrapRef} />
    </main>
  );
}
