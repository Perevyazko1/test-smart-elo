export interface WeekInfo {
    week: number | undefined;
    year: number | undefined;
}

export interface WeekData extends WeekInfo {
    str_dates: string[];
    dt_dates: string[];
    date_range: string[];
    previous_week_data: WeekData | null;
    next_week_data: WeekData | null;
    earned: string;
    hasUpdated: boolean;
    isLoading: boolean;
}