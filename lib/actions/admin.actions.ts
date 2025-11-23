'use server'

import { revalidatePath } from 'next/cache'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'

const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
    .select('+isApproved +approvalStatus') // Explicitly select approval fields
}

// ADMIN: Check if user is admin
export async function isAdmin() {
  const { userId } = auth()
  
  if (!userId) return false

  try {
    const clerkUser = await clerkClient.users.getUser(userId)
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
    
    return adminEmails.includes(userEmail || '')
  } catch (error) {
    return false
  }
}

// ADMIN: Get all pending events
export async function getPendingEvents({ limit = 10, page = 1 }: { limit?: number, page?: number }) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find({ approvalStatus: 'pending' })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments({ approvalStatus: 'pending' })

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}

// ADMIN: Get all events (approved, pending, rejected)
export async function getAllEventsAdmin({ 
  query, 
  limit = 10, 
  page = 1, 
  status 
}: { 
  query?: string, 
  limit?: number, 
  page?: number,
  status?: 'pending' | 'approved' | 'rejected' | 'all'
}) {
  try {
    await connectToDatabase()

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    const statusCondition = status && status !== 'all' ? { approvalStatus: status } : {}
    
    const conditionsArray = [titleCondition, statusCondition].filter(cond => Object.keys(cond).length > 0)

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditionsArray.length > 0 ? { $and: conditionsArray } : {})
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditionsArray.length > 0 ? { $and: conditionsArray } : {})

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}

// ADMIN: Approve event
export async function approveEvent(eventId: string) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required')
    }

    await connectToDatabase()

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { isApproved: true, approvalStatus: 'approved' },
      { new: true }
    )

    if (!updatedEvent) {
      throw new Error('Event not found')
    }

    revalidatePath('/admin/events')
    revalidatePath('/')
    
    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    console.error('Error in approveEvent:', error)
    throw error
  }
}

// ADMIN: Reject event
export async function rejectEvent(eventId: string) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required')
    }

    await connectToDatabase()

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { isApproved: false, approvalStatus: 'rejected' },
      { new: true }
    )

    if (!updatedEvent) {
      throw new Error('Event not found')
    }

    revalidatePath('/admin/events')
    revalidatePath('/')
    
    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    console.error('Error in rejectEvent:', error)
    throw error
  }
}

// ADMIN: Delete any event (override owner check)
export async function adminDeleteEvent(eventId: string) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required')
    }

    await connectToDatabase()

    const deletedEvent = await Event.findByIdAndDelete(eventId)
    
    if (!deletedEvent) {
      throw new Error('Event not found')
    }
    
    revalidatePath('/admin/events')
    revalidatePath('/')
    
    return JSON.parse(JSON.stringify(deletedEvent))
  } catch (error) {
    console.error('Error in adminDeleteEvent:', error)
    throw error
  }
}
