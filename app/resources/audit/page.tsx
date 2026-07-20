"use client";

import dynamic from "next/dynamic";

const AuditReportViewer = dynamic(() => import("../audit-report-viewer"), {
  ssr: false,
});

export default function AuditReport() {
  return <AuditReportViewer />;
}
