import { redisPublisher } from "sholatku-reminder-shared/redis/RedisClient.js";
import { PrayerEvent } from "sholatku-reminder-shared/types/SholatKu.types.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import { Location } from "./domain/Location.js";
import { PrayerScheduler } from "./domain/PrayerScheduler.js";
import { SubscriptionRepository } from "./domain/SubscriptionRepository.js";
import { SubscriptionState } from "./domain/SubscriptionState.js";
// import { SubscriptionProvider } from "../types/Subscription.types.js";

console.log(`[${tags.PrayerService}] Loaded SholatKu Client.`);

const location = new Location()
const subs = new SubscriptionRepository()

// async function init(): Promise<void> {
//   const jogja = await location.getByLocation({
//     province: "D.I. Yogyakarta",
//     city: "Kab. Gunungkidul"
//   })

//   const jakarta = await location.getByLocation({
//     province: "DKI Jakarta",
//     city: "Kota Jakarta"
//   })

//   if (!jogja) {
//     console.log(`[${tags.Error}] Jogja not found.`)
//     return
//   }

//   if (!jakarta) {
//     console.log(`[${tags.Error}] Jakarta not found.`)
//     return
//   }

//   await subs.register({
//     locationId: jakarta.id,
//     providerName: SubscriptionProvider.Discord,
//     metadata: {
//       authorId: "506108777343352881",
//       channelId: "632209598035787781",
//       guildId: "632198121866264597"1
//     }
//   })

//   await subs.register({
//     locationId: jogja.id,
//     providerName: SubscriptionProvider.Discord,
//     metadata: {
//       authorId: "506108777343352881",
//       channelId: "1471750280713601116",
//       guildId: "598412465750933504"
//     }
//   })
// }

// await init()

async function check(): Promise<void> {
  const subscribedLocations = await location.getSubscribedLocations()

  if (subscribedLocations.length === 0) {
    console.log(`[${tags.Error}] No subscriptions found.`)
    return
  }

  // console.log(subscribedLocations)

  for (const loc of subscribedLocations) {
    // console.log(`[${tags.PrayerService}] Checking location ${loc.city}, ${loc.province} with id ${loc.id}.`)
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

        if (res.type === PrayerEvent.NextPrayer) continue
        console.log(`[${tags.PrayerService}] Publishing event ${res.eventName} (${res.type}) to ${subscribers.length} subs.`)

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