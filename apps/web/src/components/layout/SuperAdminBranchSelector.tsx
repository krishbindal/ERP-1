"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SuperAdminBranchSelector({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const currentBranchId = searchParams.get("branchId") || "";

  useEffect(() => {
    async function loadBranches() {
      const supabase = createClient();
      const { data } = await supabase
        .from("branches")
        .select("id, name")
        .eq("organization_id", organizationId)
        .order("name");
      if (data) {
        setBranches(data);
      }
    }
    loadBranches();
  }, [organizationId]);

  return (
    <select
      aria-label="Branch"
      value={currentBranchId}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value) {
            url.searchParams.set("branchId", e.target.value);
        } else {
            url.searchParams.delete("branchId");
        }
        router.push(url.pathname + url.search);
      }}
      className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1.5 min-h-[36px] sm:min-h-0 rounded-md border border-gray-200 focus-ring cursor-pointer"
    >
      <option value="">Select Branch...</option>
      {branches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
