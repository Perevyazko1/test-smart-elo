export interface week_data {
    week: number
    year: number
}

export interface week_info {
    week: number
    year: number
    str_dates: string[]
    date_range: string[]
    previous_week_data: week_data
    next_week_data: week_data
}