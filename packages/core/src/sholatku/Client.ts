import { PrayerEvent } from "sholatku-reminder-shared/types/SholatKu.types.js";
import { SubscriptionProvider } from "sholatku-reminder-shared/types/Subscription.types.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import { redisClient } from "../database/RedisClient.js";
import { Location } from "./domain/Location.js";
import { PrayerScheduler } from "./domain/PrayerScheduler.js";
import { SubscriptionRepository } from "./domain/SubscriptionRepository.js";
import { SubscriptionState } from "./domain/SubscriptionState.js";
// import { SubscriptionProvider } from "../types/Subscription.types.js";

console.log(`[${tags.PrayerService}] Loaded SholatKu Client.`);

const location = new Location()
const subs = new SubscriptionRepository()

async function init(): Promise<void> {
  const jogja = await location.getByLocation({
    province: "D.I. Yogyakarta",
    city: "Kab. Gunungkidul"
  })

  const jakarta = await location.getByLocation({
    province: "DKI Jakarta",
    city: "Kota Jakarta"
  })

  if (!jogja) {
    console.log(`[${tags.Error}] Jogja not found.`)
    return
  }

  if (!jakarta) {
    console.log(`[${tags.Error}] Jakarta not found.`)
    return
  }

  await subs.register({
    locationId: jakarta.id,
    providerName: SubscriptionProvider.Discord,
    metadata: {
      authorId: "506108777343352881",
      channelId: "632209598035787781",
      guildId: "632198121866264597"
    },
    userId: "123"
  })

  await subs.register({
    locationId: jogja.id,
    providerName: SubscriptionProvider.Discord,
    metadata: {
      authorId: "506108777343352881",
      channelId: "1471750280713601116",
      guildId: "598412465750933504"
    },
    userId: "123"
  })
}

await init()

async function check(): Promise<void> {
  // deduped locations
  const subscriberLocations = await subs.getLocations()

  if (subscriberLocations.length === 0) {
    console.log(`[${tags.Error}] No subscriptions found.`)
    return
  }

  // On deduped locations
  for (const loc of subscriberLocations) {
    // run a check
    const scheduler = new PrayerScheduler(loc.id)
    const check = await scheduler.cycleCheck()

    // if there no updates, skip
    if (!check) continue

    // get every subscriptions on that location
    const subscribers = await subs.getByLocation(loc.id)

    // on every event of every subs
    for (const ev of check) {
      // batch fetch all states for all subs on this date — 1 query instead of N
      const stateMap = await SubscriptionState.getBatch(
        subscribers.map(s => s.id),
        ev.time.toDate()
      )

      for (const sub of subscribers) {
        const subState = new SubscriptionState(sub.id)

        // check sub state, have i send x event prayer to this sub before?
        const stateCheck = stateMap.get(`${sub.id}:${ev.eventName}:${ev.type}`)

        // oh, i already did, skip
        if (stateCheck) continue

        // if not, sends
        await redisClient.publish(ev.type, JSON.stringify({
          event: ev,
          location: loc,
          subscription: sub,
        }))

        // skip notification for a prayer
        if (ev.type === PrayerEvent.NextPrayer) continue
        console.log(`[${tags.PrayerService}] Publishing event ${ev.eventName} (${ev.type}) to ${subscribers.length} subs.`)

        // update the state check, marking i have notify a sub of x event prayer
        await subState.set({
          prayerName: ev.eventName,
          prayerType: ev.type,
          date: ev.time.toDate(),
          value: true
        })
      }
    }
  }
}

await check()
setInterval(() => void check(), 3 * 1000)