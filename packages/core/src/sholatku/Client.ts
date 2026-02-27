import tags from "sholatku-reminder-shared/utils/Tags.js";
import { SubscriptionProvider } from "../types/Subscription.types.js";
import { Location } from "./domain/Location.js";
import { PrayerScheduler } from "./domain/PrayerScheduler.js";
import { SubscriptionRepository } from "./domain/SubscriptionRepository.js";
import { SubscriptionState } from "./domain/SubscriptionState.js";
import { redisPublisher } from "sholatku-reminder-shared/redis/RedisClient.js";
import { PrayerEvent } from "../types/SholatKu.types.js";

console.log(`[${tags.PrayerService}] Loaded SholatKu Client.`);

async function check(): Promise<void> {
  const location = new Location()
  const subs = new SubscriptionRepository()

  const subscribedLocations = await location.getSubscribedLocations()

  if (subscribedLocations.length === 0) {
    console.log(`[${tags.Error}] No subscriptions found. Adding dumy data`)

    const locky = await location.getByLocation({
      province: "D.I. Yogyakarta",
      city: "Kab. Gunungkidul"
    })

    if (!locky) {
      console.log(`[${tags.Error}] Locky not found.`)
      return
    }

    await subs.register({
      locationId: locky.id,
      providerName: SubscriptionProvider.Discord,
      metadata: {
        authorId: "506108777343352881",
        channelId: "1471750280713601116",
        guildId: "598412465750933504"
      }
    })
    return
  }

  for (const loc of subscribedLocations) {
    const scheduler = new PrayerScheduler(loc.id)
    const checks = await scheduler.cycleCheck()

    if (!checks) continue

    const subscribers = await subs.getByLocation(loc.id)

    // for (const sub of subscribers) {
    //   console.log(`[${tags.Debug}] ${sub.providerName}`)
    //   console.log(sub.metadata)
    //   console.log(loc)
    // }

    for (const res of checks) {
      for (const sub of subscribers) {
        const subState = new SubscriptionState(sub.id)

        const stateCheck = await subState.get({
          prayerName: res.eventName,
          prayerType: res.type,
          date: res.time.toDate()
        })

        if (stateCheck) continue

        await redisPublisher.publish(res.type, JSON.stringify({
          event: res,
          location: loc,
          subscription: sub,
        }))

        if (res.type === PrayerEvent.NextPrayer) return
        console.log(`[${tags.PrayerService}] Publishing event ${res.eventName} (${res.type}).`)

        await subState.set({
          prayerName: res.eventName,
          prayerType: res.type,
          date: res.time.toDate(),
          value: true
        })
      }
    }
  }
}

await check()
setInterval(() => void check(), 3 * 1000)