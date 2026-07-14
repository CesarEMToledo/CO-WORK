"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "open" | "in_progress" | "resolved";

const STATUS_LABEL: Record<Status, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
};

export function IssueStatusSelect({ issueId, status }: { issueId: string; status: Status }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (nextStatus: Status) => {
    setLoading(true);
    await fetch(`/api/issue-reports/${issueId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as Status)}
      className="text-xs font-bold border border-outline/20 rounded-lg px-2 py-1.5 bg-white disabled:opacity-60"
    >
      {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}
