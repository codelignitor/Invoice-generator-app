"use client";
import { useEffect, useRef, useState } from "react";
import { calc, fmt, fmtDate, fmtMonth } from "@/lib/invoice";

const W = 794; // A4 width at 96dpi
const MIN_SCALE = 0.5; // below this, the preview scrolls sideways instead of shrinking

export default function InvoicePreview({ data, invRef, wrapRef }) {
  const stageRef = useRef(null);
  const [k, setK] = useState(1);
  const [h, setH] = useState(1123);
  const { rows, sub, tax, total } = calc(data.items);

  useEffect(() => {
    // inside useEffect → update():
    const update = () => {
      const avail = stageRef.current.clientWidth;
      setK(Math.min(1, Math.max(MIN_SCALE, avail / W)));
      setH(invRef.current.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stageRef.current);
    ro.observe(invRef.current);
    return () => ro.disconnect();
  }, [invRef]);

  const th = "border-r-2 border-white bg-neutral-200 px-1.5 py-2.5 text-center text-xs font-semibold";
  const td = "border-r-2 border-white bg-neutral-100 px-2 py-3.5 text-xs";

  return (
     <div ref={stageRef} className="stage w-full overflow-x-auto rounded-lg">
      <div className="sizer relative" style={{ width: W * k, height: h * k }}>
      <div
        ref={wrapRef}
        className="preview-wrap absolute left-0 top-0 origin-top-left"
        style={{ width: W, transform: `scale(${k})` }}
      >
        <div
          id="invoice"
          ref={invRef}
          className="relative min-h-[1123px] w-[794px] bg-white px-[38px] pb-8 pt-[38px] font-[Arial,Helvetica,sans-serif] text-[13px] leading-snug text-black shadow-lg"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-blue-600 pb-2.5">
            <div className="flex h-[75px] w-[130px] items-center">
              {data.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.logo} alt="" className="max-h-full max-w-full object-contain" />
              )}
            </div>
            <div className="text-right leading-[1.6]">
              <div className="text-[17px] font-bold">{data.co}</div>
              <div>{data.addr}</div>
              <div>{data.tel}</div>
              <div>Email: {data.email}</div>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-6 flex justify-between">
            <div className="leading-[1.7]">
              <div>To:</div>
              <div className="font-bold">{data.cn}</div>
              <div className="text-xs">{data.ca}</div>
            </div>
            <div className="text-right">
              <div className="text-[17px] font-bold text-blue-600">INVOICE: {data.no}</div>
              <div className="mt-2 leading-[1.7]">
                <div>Issue Date: {fmtDate(data.date)}</div>
                <div>Billing Month: {fmtMonth(data.bm)}</div>
                <div>Currency: {data.cur}</div>
                <div>
                  Status: <b>{data.st}</b>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <table className="mt-6 w-full border-collapse">
            <thead>
              <tr>
                <th className={th} style={{ width: 60 }}>No.</th>
                <th className={th}>Service Details</th>
                <th className={th}>Amount excl.<br />of Tax</th>
                <th className={th}>Tax<br />%</th>
                <th className={th}>Tax<br />Amount</th>
                <th className={th}>Amount incl.<br />of Tax</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className={`${td} text-center`}>{String(i + 1).padStart(2, "0")}</td>
                  <td className={`${td} text-center`}>{r.d}</td>
                  <td className={`${td} text-right`}>{fmt(r.a)}</td>
                  <td className={`${td} text-right`}>{fmt(r.t)}</td>
                  <td className={`${td} text-right`}>{fmt(r.ta)}</td>
                  <td className={`${td} bg-neutral-300 text-right`}>{fmt(r.inc)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="ml-auto mt-1.5 w-[46%] text-xs font-bold">
            <div className="flex justify-between border-b border-blue-300 py-3 pl-[70px] pr-2">
              <span>SUBTOTAL</span><span>{fmt(sub)}</span>
            </div>
            <div className="flex justify-between border-b border-blue-300 py-3 pl-[70px] pr-2">
              <span>TAX</span><span>{fmt(tax)}</span>
            </div>
            <div className="flex justify-between py-3 pl-[70px] pr-2 text-blue-600">
              <span>GRAND TOTAL</span><span>{fmt(total)}</span>
            </div>
          </div>

          {/* Note */}
          <div className="mt-1.5 min-h-[34px] whitespace-pre-wrap border-l-4 border-blue-600 bg-blue-50 p-2.5 text-xs">
            NOTE: {data.note}
          </div>

          {/* Payment */}
          <div className="mt-7 whitespace-pre-line text-center text-xs leading-relaxed">{data.pay}</div>

          <div className="mt-5 border-b-2 border-neutral-500 pb-3 text-center text-xs leading-[1.7]">
            <div className="font-serif text-[11px] text-neutral-600">For Billing Concerns Please Contact:</div>
            <div className="whitespace-pre-line">{data.bill}</div>
          </div>

          {/* Payment method logos */}
          {data.payLogos.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-around gap-3">
              {data.payLogos.map((l) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={l.id} src={l.src} alt="" className="h-8 max-w-[110px] object-contain" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
