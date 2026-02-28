<div align="center">
    <h1>Prayer Reminder</h1>
    <p>A Islamic prayer reminder system using Node.js</p>
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/adwerygaming/sholatku-reminder/latest?style=for-the-badge">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/adwerygaming/sholatku-reminder?style=for-the-badge">
    <img alt="Discord" src="https://img.shields.io/discord/561136271901196298?style=for-the-badge&label=Discord&logo=discord">
    <img alt="GitHub issue custom search in repo" src="https://img.shields.io/github/issues-search/adwerygaming/sholatku-reminder?query=is%3Aopen&style=for-the-badge&label=Open%20Issues">
</div>

> [!CAUTION]
> This `dev` branch is having different system from `main` branch, and it's still in development. do not use it yet. ok?

## Showcase
This is an example of how the prayer reminder system can be used to send prayer time notifications to a Discord channel.

<div align=center>
    <img alt="Discord bot sending a prayer notification in a Discord channel, displaying the prayer name, time, and location information with a clean interface" src="/assets/images/example.png"></img>
</div>

## Packages
This project is a monorepo that consists of several packages, each with its own purpose and functionality. Here are the main packages in this project:

1. <b>`sholatku-reminder-core`</b>

    <b>This package contains the core logic and functionality of the prayer reminder system.</b> It includes the main scheduler that calculates prayer times and triggers events based on the schedule. It also defines the data structures and interfaces used throughout the system.

2. <b>`sholatku-reminder-shared`</b>

    <b>This package contains shared utilities and components that are used across different packages in the monorepo.</b> It includes common functions, types, and configurations that can be reused by other packages to ensure consistency and reduce code duplication. And especially the Redis client that is used for communication between the core and the providers.

3. <b>`sholatku-reminder-discord`</b> [Provider]

    <b>This package is a provider that integrates the prayer reminder system with Discord. </b>It listens for prayer events from the core package and sends notifications to a specified Discord channel using a bot.

4. <b>`sholatku-reminder-whatsapp`</b> [Provider]

    <b>Same as discord, a provider that integrates the prayer reminder system with WhatsApp.</b> It listens for prayer events from the core package and sends notifications to a specified WhatsApp number using a bot.

## How it works

**The core package** is basically just a polling system. it checks every few seconds or idk to check if is it time to trigger AND has it NOT triggered before? if yes, fire the event via Redis message broker. andd also update the state. is that easy? yes. is it practical? maybe. but it works. remember, if it ain't broke, don't fix it. lmao

Below is the diagram of how the system works in general:

<div align=center>
    <img alt="Showcase" src="/assets/images/sholatku-flow.png"></img>
</div>

<b>Redis message broker</b> is used for distributing the prayer event to multiple provider at the same time.
Currently, we only have <b>Discord</b> and <b>WhatsApp</b> but we will add more provider in the future, such as Telegram, Slack, and more. Or you can contribute to this project by adding your own provider.

## Prerequisites
To install this project, you need these prerequisites:
- **Node.js** (version 21 or higher)
- **NPM** (should be included with Node.js)
- **PM2** NPM Package
- **Docker**
- **Docker Compose**

> [!IMPORTANT]
> **Docker** is used to run **postgreSQL and Redis**, which are the database and message broker used by the system.You can learn more in [docker-compose.yml](./docker/docker-compose.yml) file on this repository.

## Usage
There are <b>4 events available to use</b>, that includes `PrayerTime`, `PrayerIn5m`, `PrayerIn15m`, and `PrayerIn30m`. Each event will trigger at the specified time before the prayer time, allowing you to set up reminders or perform any necessary actions.

Here an example of <b>how a provider can subscribe to the prayer event</b> using the Redis message broker:
```ts
import { redisSubscriber } from "sholatku-reminder-shared/redis/RedisClient.js"

redisSubscriber.on("message", async (channel, rawMessage) => {
    // Construct back the payload
    const raw = JSON.parse(rawMessage) as SerializedPrayerEventPayload
    const payload: PrayerEventPayload = {
        ...raw,
        event: { ...raw.event, time: moment(raw.event.time) }
    }

    // Ready to use
    const { event, location, subscription } = payload
})
```