"use client";

import { IEvent } from "@/lib/database/models/event.model";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";
import { getAvailableTickets } from "@/lib/actions/order.actions";

const CheckoutButton = ({ event }: { event: IEvent }) => {
  const { user } = useUser();
  const userId = user?.id;
  const hasEventFinished = new Date(event.endDateTime) < new Date();
  const [availableTickets, setAvailableTickets] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (event.maxTickets && event.maxTickets > 0) {
        const tickets = await getAvailableTickets(event._id);
        setAvailableTickets(tickets);
      }
      setLoading(false);
    };
    fetchTickets();
  }, [event._id, event.maxTickets]);

  const isSoldOut =
    event.maxTickets && event.maxTickets > 0 && availableTickets === 0;

  return (
    <div className="flex items-center gap-3">
      {hasEventFinished ? (
        <p className="p-2 text-red-400">
          Sorry, tickets are no longer available.
        </p>
      ) : isSoldOut ? (
        <p className="p-2 text-red-400">Sorry, this event is sold out.</p>
      ) : (
        <>
          {event.maxTickets && event.maxTickets > 0 && !loading && (
            <p className="p-2 text-green-600">
              {availableTickets !== null ? availableTickets : event.maxTickets}{" "}
              tickets available
            </p>
          )}
          <SignedOut>
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/sign-in">Get Tickets</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            {userId && <Checkout event={event} userId={userId} />}
          </SignedIn>
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
