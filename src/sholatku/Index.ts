import moment from "moment-timezone"

const data = [
    {
        "tanggal": 1,
        "imsak": "04:14",
        "subuh": "04:24",
        "terbit": "05:38",
        "dhuha": "06:06",
        "dzuhur": "11:55",
        "ashar": "15:03",
        "maghrib": "18:04",
        "isya": "19:15"
    }
]

function convertTimeToMoment(time: string) {
    if (!time.includes(":") || !time) return null

    const obj = moment(time, "HH:mm")

    return obj
}

const now = moment()
const province = "D.I. Yogyakarta"
const city = "Kab. Gunungkidul"