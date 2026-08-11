import mongoose from "mongoose"
import CollectionRoute from "../models/CollectionRoute.js"
import CollectionSchedule from "../models/CollectionSchedule.js"
import WasteEntry from "../models/WasteEntry.js"
import { generateRouteForZone } from "../services/routeOptimizer.service.js"

export async function getTodayRoute(req, res) {
  try {
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const route = await CollectionRoute.findOne({
      assignedDriverId: req.user._id,
      collectionDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate("assignedDriverId", "name email")

    return res.status(200).json({ route: route || null })
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" })
  }
}

export async function updateRouteStatus(req, res) {
  try {
    const { routeId } = req.params
    const { status } = req.body

    if (!["in_progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" })
    }

    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: "Invalid routeId" })
    }

    const route = await CollectionRoute.findById(routeId)
    if (!route) return res.status(404).json({ error: "Route not found" })

    if (route.assignedDriverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden: not your route" })
    }

    route.status = status
    await route.save()

    return res.status(200).json({ updated: true, newStatus: status })
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" })
  }
}

export async function completeStop(req, res) {
  try {
    const { routeId, stopOrder } = req.params
    const orderNum = parseInt(stopOrder, 10)

    if (!mongoose.Types.ObjectId.isValid(routeId) || isNaN(orderNum) || orderNum < 1) {
      return res.status(400).json({ error: "Invalid routeId or stopOrder" })
    }

    const route = await CollectionRoute.findById(routeId)
    if (!route) return res.status(404).json({ error: "Route not found" })

    if (route.assignedDriverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden: not your route" })
    }

    const stop = route.stops.find((s) => s.order === orderNum)
    if (!stop) return res.status(404).json({ error: "Stop not found" })

    await WasteEntry.updateMany(
      { _id: { $in: stop.wasteEntryIds } },
      { collectionStatus: "collected" }
    )

    const nextStop = route.stops.find((s) => s.order === orderNum + 1) || null

    const allDone = route.stops.every(
      (s) => s.order <= orderNum || s.order === orderNum
    )
    if (!nextStop) {
      route.status = "completed"
      await route.save()
    }

    return res.status(200).json({
      completedStop: orderNum,
      nextStop: nextStop
        ? {
            order: nextStop.order,
            address: nextStop.address,
            estimatedArrival: nextStop.estimatedArrival
          }
        : null,
      routeCompleted: !nextStop
    })
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" })
  }
}

export async function getRoutes(req, res) {
  try {
    const { zone, date } = req.query
    const filter = {}

    if (zone) {
      if (!["NW", "NE", "SW", "SE"].includes(zone)) {
        return res.status(400).json({ error: "Invalid zone" })
      }
      filter.zone = zone
    }

    if (date) {
      const parsed = new Date(date)
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: "Invalid date format" })
      }
      const startOfDay = new Date(parsed)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(parsed)
      endOfDay.setHours(23, 59, 59, 999)
      filter.collectionDate = { $gte: startOfDay, $lte: endOfDay }
    }

    const routes = await CollectionRoute.find(filter).populate(
      "assignedDriverId",
      "name email"
    )

    return res.status(200).json({ routes })
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" })
  }
}

export async function manualGenerate(req, res) {
  try {
    const { zone, date, driverId } = req.body

    if (!["NW", "NE", "SW", "SE"].includes(zone)) {
      return res.status(400).json({ error: "zone is required and must be NW|NE|SW|SE" })
    }

    const parsedDate = new Date(date)
    if (!date || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "date is required and must be a valid date string" })
    }

    let resolvedDriverId = driverId

    if (!resolvedDriverId) {
      const schedule = await CollectionSchedule.findOne({ zone })
      if (!schedule) {
        return res.status(404).json({ error: "No schedule or driver found for this zone" })
      }
      resolvedDriverId = schedule.assignedDriverId
    }

    generateRouteForZone(zone, parsedDate, resolvedDriverId).catch((err) => {
      console.error(`[ManualGenerate] Zone ${zone} failed:`, err.message)
    })

    return res.status(202).json({
      message: "Route generation started",
      zone,
      date: parsedDate.toISOString()
    })
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" })
  }
}
