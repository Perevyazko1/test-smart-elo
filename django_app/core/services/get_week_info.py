import datetime
from dataclasses import dataclass


@dataclass
class WeekInfo:
    week: str
    year: str
    str_dates: [str]
    dt_dates: list[datetime]
    date_range: list[datetime]
    previous_week_data: dict
    next_week_data: dict
    earned: int = 0


class GetWeekInfo:
    def __init__(self, week: str = None, year: str = None):
        self.week = week
        self.year = year

    def _get_initial_values(self):
        if not self.week or not self.week.isdigit():
            self.week = datetime.datetime.today().isocalendar()[1]

        if not self.year or not self.year.isdigit():
            self.year = datetime.datetime.now().year

    def execute(self) -> WeekInfo:
        self._get_initial_values()

        str_week = f'{self.year}-{self.week}-1'
        first_day = datetime.datetime.strptime(str_week, "%G-%V-%u")

        str_dates = []
        dt_dates = []
        for day in range(8):
            str_dates.append((first_day + datetime.timedelta(days=day)).strftime('%d.%m'))
            dt_dates.append(first_day + datetime.timedelta(days=day))

        range_first = dt_dates[0]
        range_last = dt_dates[-1]
        date_range = [range_first, range_last]

        prev_week = (first_day - datetime.timedelta(days=7)).isocalendar()[1]
        prev_week_year = (first_day - datetime.timedelta(days=7)).isocalendar()[0]
        next_week = (first_day + datetime.timedelta(days=7)).isocalendar()[1]
        next_week_year = (first_day + datetime.timedelta(days=7)).isocalendar()[0]

        previous_week_data = {"week": prev_week, "year": prev_week_year}
        next_week_data = {"week": next_week, "year": next_week_year}

        return WeekInfo(
            week=self.week,
            year=self.year,
            str_dates=str_dates,
            dt_dates=dt_dates,
            date_range=date_range,
            previous_week_data=previous_week_data,
            next_week_data=next_week_data
        )
