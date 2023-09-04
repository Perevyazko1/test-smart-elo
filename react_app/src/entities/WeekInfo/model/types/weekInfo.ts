export interface week_data {
    week: number | undefined;
    year: number | undefined;
}

export interface week_info extends week_data {
    str_dates: string[];
    dt_dates: string[];
    date_range: string[];
    previous_week_data: week_data | null;
    next_week_data: week_data | null;
    earned: number;
}