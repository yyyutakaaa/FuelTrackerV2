export interface Location {
    lat: number
    lng: number
    name: string
}

export interface FuelPrice {
    station: string
    location: string
    fuelType: string
    price: number
    updatedAt: string
    lat?: number
    lng?: number
}

export interface Trip {
    id: string
    from: Location
    to: Location
    distance: number
    duration: number
    fuelType: string
    fuelPrice: number
    cost: number
    date: string
}

export interface RouteInfo {
    distance: number
    duration: number
}