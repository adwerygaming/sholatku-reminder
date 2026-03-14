"use client"

import { Input } from "@/components/ui/input"
import { APIService } from "@/lib/APIService"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import { LocationSearchResult } from "../../../shared/types/Location.types"

const api = new APIService()

interface SelectLocationSectionProps {
    onProvinceChange: (value: LocationSearchResult | null) => void
    onCityChange: (value: LocationSearchResult | null) => void
}

export default function SelectLocationSection({ onProvinceChange, onCityChange }: SelectLocationSectionProps) {
    const [provinceQuery, setProvinceQuery] = useState("")
    const [cityQuery, setCityQuery] = useState("")
    const [provinceSuggestions, setProvinceSuggestions] = useState<LocationSearchResult[]>([])
    const [citySuggestions, setCitySuggestions] = useState<LocationSearchResult[]>([])
    const [selectedProvince, setSelectedProvince] = useState<LocationSearchResult | null>(null)
    const [selectedCity, setSelectedCity] = useState<LocationSearchResult | null>(null)

    const updateProvince = (value: LocationSearchResult | null) => {
        setSelectedProvince(value)
        onProvinceChange?.(value)
    }

    const updateCity = (value: LocationSearchResult | null) => {
        setSelectedCity(value)
        onCityChange?.(value)
    }

    const [debouncedProvinceQuery] = useDebounce(provinceQuery, 400)
    const [debouncedCityQuery] = useDebounce(cityQuery, 400)

    useEffect(() => {
        (async () => {
            if (!debouncedProvinceQuery) {
                setProvinceSuggestions([])
                updateProvince(null)
                updateCity(null)
                setCityQuery("")
                setCitySuggestions([])
                return
            }

            api.searchProvince(debouncedProvinceQuery).then((res) => {
                setProvinceSuggestions(res ?? [])
            })
        })()
    }, [debouncedProvinceQuery])

    useEffect(() => {
        (async () => {
            if (!debouncedCityQuery || !selectedProvince) {
                setCitySuggestions([])
                return
            }

            api.searchCity(selectedProvince.original, debouncedCityQuery).then((res) => {
                setCitySuggestions(res ?? [])
            })
        })()
    }, [debouncedCityQuery, selectedProvince])

    useEffect(() => {
        (async () => {
            updateProvince({ original: 'D.I. Yogyakarta', searchKey: 'yogyakarta' })
            updateCity({ original: "Kab. Gunungkidul", searchKey: "kabgungkidul"})
        })()
    }, [])

    return (
        <div className="space-y-3">
            <p className="font-semibold">Choose your Location</p>

            <div className="flex flex-row gap-4">
                {/* Province */}
                <div className="flex-1 space-y-2">
                    <Input
                        placeholder="Search province..."
                        value={provinceQuery}
                        onChange={(e) => {
                            setProvinceQuery(e.target.value)
                            updateProvince(null)
                            setCityQuery("")
                            updateCity(null)
                            setCitySuggestions([])
                        }}
                    />
                    
                    {provinceSuggestions.length > 0 && !selectedProvince && (
                        <div className="border rounded-md overflow-hidden">
                            {provinceSuggestions.map((s) => (
                                <button
                                    key={`province-${s.searchKey}`}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                                    onClick={() => {
                                        updateProvince(s)
                                        setProvinceQuery(s.original)
                                        setProvinceSuggestions([])
                                    }}
                                >
                                    {s.original}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* City */}
                <div className="flex-1 space-y-2">
                    <Input
                        placeholder="Search city..."
                        value={cityQuery}
                        disabled={!selectedProvince}
                        onChange={(e) => {
                            setCityQuery(e.target.value)
                            updateCity(null)
                        }}
                    />
                    {citySuggestions.length > 0 && !selectedCity && (
                        <div className="border rounded-md overflow-hidden">
                            {citySuggestions.map((s) => (
                                <button
                                    key={`city-${s.searchKey}`}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                                    onClick={() => {
                                        updateCity(s)
                                        setCityQuery(s.original)
                                        setCitySuggestions([])
                                    }}
                                >
                                    {s.original}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
