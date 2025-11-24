"use server"

import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import {ObjectId} from 'mongodb';
import User from '../database/models/user.model';
import { clerkClient } from '@clerk/nextjs/server';

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  try {
    // Create order directly without Stripe
    await connectToDatabase();

    // Check if event has available tickets
    const event = await Event.findById(order.eventId);
    if (!event) throw new Error('Event not found');
    
    // If maxTickets is set and greater than 0, check availability
    if (event.maxTickets && event.maxTickets > 0) {
      // Count existing orders for this event
      const existingOrders = await Order.countDocuments({ event: order.eventId });
      
      if (existingOrders >= event.maxTickets) {
        throw new Error('Sorry, this event is sold out');
      }
    }

    let buyer = await User.findOne({ clerkId: order.buyerId })
    
    // If buyer doesn't exist, create them from Clerk data
    if (!buyer) {
      console.log('Buyer not found in DB, fetching from Clerk...')
      const clerkUser = await clerkClient.users.getUser(order.buyerId)
      
      buyer = await User.create({
        clerkId: order.buyerId,
        email: clerkUser.emailAddresses[0].emailAddress,
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split('@')[0],
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        photo: clerkUser.imageUrl,
      })
      
      console.log('Buyer created successfully')
    }
    
    const newOrder = await Order.create({
      eventTitle: order.eventTitle,
      eventId: order.eventId,
      buyerId: order.buyerId,
      totalAmount: order.isFree ? '0' : order.price,
      createdAt: new Date(),
      event: order.eventId,
      buyer: buyer._id,
    });

    // Redirect to profile page
    redirect('/profile?success=true')
  } catch (error) {
    console.error('Checkout error:', error)
    throw error;
  }
}

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    const buyer = await User.findOne({ clerkId: order.buyerId })
    if (!buyer) throw new Error('Buyer not found')
    
    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: buyer._id,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY EVENT
export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase()

    if (!eventId) throw new Error('Event ID is required')
    const eventObjectId = new ObjectId(eventId)

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $unwind: '$buyer',
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
        },
      },
      {
        $match: {
          $and: [{ eventId: eventObjectId }, { buyer: { $regex: RegExp(searchString, 'i') } }],
        },
      },
    ])

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    handleError(error)
  }
}

// GET ORDERS BY USER
export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
  try {
    await connectToDatabase()

    let user = await User.findOne({ clerkId: userId })
    
    // If user doesn't exist, return empty data instead of throwing error
    if (!user) {
      console.log('User not found in database, returning empty orders')
      return { 
        data: [], 
        totalPages: 0 
      }
    }

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { buyer: user._id }

    const orders = await Order.distinct('event._id')
      .find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      })

    const ordersCount = await Order.distinct('event._id').countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(orders)), totalPages: Math.ceil(ordersCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

// GET AVAILABLE TICKETS COUNT FOR AN EVENT
export async function getAvailableTickets(eventId: string) {
  try {
    await connectToDatabase()

    const event = await Event.findById(eventId)
    if (!event || !event.maxTickets || event.maxTickets === 0) {
      return null // Unlimited tickets
    }

    const soldTickets = await Order.countDocuments({ event: eventId })
    const availableTickets = event.maxTickets - soldTickets

    return availableTickets > 0 ? availableTickets : 0
  } catch (error) {
    handleError(error)
    return null
  }
}

// GET EVENT ATTENDEES (BUYERS) - For event organizers
export async function getEventAttendees(eventId: string) {
  try {
    await connectToDatabase()

    const attendees = await Order.find({ event: eventId })
      .populate({
        path: 'buyer',
        model: User,
        select: 'firstName lastName email',
      })
      .sort({ createdAt: 'desc' })
      .lean()

    const formattedAttendees = attendees.map((order: any) => ({
      id: order._id.toString(),
      name: `${order.buyer.firstName} ${order.buyer.lastName}`,
      email: order.buyer.email,
      purchaseDate: order.createdAt,
      amount: order.totalAmount,
    }))

    return JSON.parse(JSON.stringify(formattedAttendees))
  } catch (error) {
    handleError(error)
    return []
  }
}
