"use client";

import { IEvent } from "@/lib/database/models/event.model";
import { formatDateTime } from "@/lib/utils";
import {
  approveEvent,
  rejectEvent,
  adminDeleteEvent,
} from "@/lib/actions/admin.actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type EventCardAdminProps = {
  event: IEvent;
  onUpdate: () => void;
};

export default function EventCardAdmin({
  event,
  onUpdate,
}: EventCardAdminProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await approveEvent(event._id);
      if (result) {
        onUpdate();
      } else {
        setError("Failed to approve event");
      }
    } catch (error: any) {
      console.error("Approve error:", error);
      setError(error?.message || "Failed to approve event");
      alert(`Error: ${error?.message || "Failed to approve event"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await rejectEvent(event._id);
      if (result) {
        onUpdate();
      } else {
        setError("Failed to reject event");
      }
    } catch (error: any) {
      console.error("Reject error:", error);
      setError(error?.message || "Failed to reject event");
      alert(`Error: ${error?.message || "Failed to reject event"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await adminDeleteEvent(event._id);
      if (result) {
        onUpdate();
      } else {
        setError("Failed to delete event");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      setError(error?.message || "Failed to delete event");
      alert(`Error: ${error?.message || "Failed to delete event"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-600/90 text-white border border-green-700";
      case "rejected":
        return "bg-red-600/90 text-white border border-red-700";
      default:
        return "bg-amber-600/90 text-white border border-amber-700";
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-500/50 transition-all duration-300">
      {/* Status Badge Overlay */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm ${getStatusColor(
            event.approvalStatus || "pending"
          )}`}
        >
          {event.approvalStatus || "pending"}
        </span>
      </div>

      {/* Image Section */}
      <Link
        href={`/events/${event._id}`}
        className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 h-48"
      >
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={400}
          height={200}
          className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col gap-3 p-5 flex-grow">
        {/* Category and Price Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {event.category.name}
          </span>
          {event.isFree ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
              FREE
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
              ${event.price}
            </span>
          )}
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium">
            {formatDateTime(event.startDateTime).dateTime}
          </span>
        </div>

        {/* Event Title */}
        <Link href={`/events/${event._id}`}>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 hover:text-primary-500 transition-colors">
            {event.title}
          </h3>
        </Link>

        {/* Organizer */}
        <div className="flex items-center gap-2 text-sm text-slate-600 pb-3 border-b border-slate-100">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium">
            {event.organizer.firstName} {event.organizer.lastName}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 text-xs p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto">
          {(event.approvalStatus === "pending" || !event.approvalStatus) && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-sm"
                size="sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing</span>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm"
                size="sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing</span>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject
                  </>
                )}
              </Button>
            </div>
          )}

          {event.approvalStatus === "rejected" && (
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-sm w-full"
              size="sm"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Approve Event
                </>
              )}
            </Button>
          )}

          {event.approvalStatus === "approved" && (
            <Button
              onClick={handleReject}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm w-full"
              size="sm"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  Revoke Approval
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold text-sm"
          >
            {isLoading ? (
              "Deleting..."
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Event
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
