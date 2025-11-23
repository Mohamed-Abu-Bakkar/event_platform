"use client";

import { IEvent } from "@/lib/database/models/event.model";

export default function EventApprovalBadge({ event }: { event: IEvent }) {
  if (event.approvalStatus === "approved") {
    return (
      <span className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        Published
      </span>
    );
  }

  if (event.approvalStatus === "pending") {
    return (
      <span className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        Pending Approval
      </span>
    );
  }

  if (event.approvalStatus === "rejected") {
    return (
      <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        Rejected
      </span>
    );
  }

  return null;
}
