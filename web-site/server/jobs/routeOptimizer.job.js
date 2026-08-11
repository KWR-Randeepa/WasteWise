import cron from "node-cron"
import CollectionSchedule from "../models/CollectionSchedule.js"
import { generateRouteForZone } from "../services/routeOptimizer.service.js"

cron.schedule("0 22 * * *", async () => {
  console.log("[Cron] Route generation job triggered:", new Date().toISOString())

  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayOfWeek = tomorrow.getDay()

    const schedules = await CollectionSchedule.find({
      collectionDayOfWeek: dayOfWeek
    })

    console.log(
      `[Cron] Found ${schedules.length} zone(s) collecting on dayOfWeek=${dayOfWeek}`
    )

    for (const schedule of schedules) {
      try {
        await generateRouteForZone(
          schedule.zone,
          tomorrow,
          schedule.assignedDriverId
        )
      } catch (zoneErr) {
        console.error(
          `[Cron] Zone ${schedule.zone} failed:`,
          zoneErr.message
        )
      }
    }

    console.log("[Cron] Route generation job complete.")
  } catch (err) {
    console.error("[Cron] Route generation job failed:", err.message)
  }
})
