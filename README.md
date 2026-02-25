<div align="center">
    <h1>Prayer Reminder</h1>
    <p>A Islamic prayer reminder system using Node.js</p>
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/adwerygaming/sholatku-reminder/latest?style=for-the-badge">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/adwerygaming/sholatku-reminder?style=for-the-badge">
    <img alt="Discord" src="https://img.shields.io/discord/561136271901196298?style=for-the-badge&label=Discord&logo=discord">
    <img alt="GitHub issue custom search in repo" src="https://img.shields.io/github/issues-search/adwerygaming/sholatku-reminder?query=is%3Aopen&style=for-the-badge&label=Open%20Issues">
</div>

## Showcase
> [!NOTE]
> This is an example of how the prayer reminder system can be used to send prayer time notifications to a Discord channel. The system will automatically fetch the prayer times for the specified location and send reminders at the appropriate times.

<img alt="Showcase" src="/assets/images/example.png"></img>

## Usage
There are <b>4 event available to use</b>, that includes `PrayerTime`, `PrayerIn5m`, `PrayerIn15m`, and `PrayerIn30m`. Each event will trigger at the specified time before the prayer time, allowing you to set up reminders or perform any necessary actions.
```ts
import sholatkuClient from "./Client.js";

sholatkuClient.on(PrayerEvent.PrayerTime, async (payload) => {
    // Triggered when the it's time for prayer
});

sholatkuClient.on(PrayerEvent.PrayerIn5m, async (payload) => {
    // Triggered 5 minutes before the prayer time
});

sholatkuClient.on(PrayerEvent.PrayerIn15m, async (payload) => {
    // Triggered 15 minutes before the prayer time
});

sholatkuClient.on(PrayerEvent.PrayerIn30m, async (payload) => {
    // Triggered 30 minutes before the prayer time
});
```