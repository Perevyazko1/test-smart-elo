import datetime
from dataclasses import dataclass


@dataclass
class WeekInfo:
    week: int
    year: int
    str_dates: [str]
    date_range: list[str]
    previous_week_data: dict
    next_week_data: dict


class GetWeekInfo:
    def __init__(self, week: int = None, year: int = None):
        self.week = week
        self.year = year

    def _get_initial_values(self):
        if self.week is None:
            self.week = datetime.datetime.today().isocalendar()[1]

        if self.year is None:
            self.year = datetime.datetime.now().year

        if 0 > self.week > 53 or 1970 > self.year > 2100:
            print(f'GET_WEEK_INFO: Incorrect input. Week:{self.week}. Year:{self.year}')
            self.week = datetime.datetime.today().isocalendar()[1]
            self.year = datetime.datetime.now().year

    def execute(self) -> WeekInfo:
        self._get_initial_values()

        str_week = f'{self.year}-{self.week}-1'
        first_day = datetime.datetime.strptime(str_week, "%G-%V-%u")

        str_dates = []
        dt_dates = []
        for day in range(7):
            str_dates.append((first_day + datetime.timedelta(days=day)).strftime('%d.%m'))
            dt_dates.append(first_day + datetime.timedelta(days=day))

        range_first = f'{dt_dates[0].strftime("%Y-%m-%d")}'
        range_last = f'{dt_dates[-1].strftime("%Y-%m-%d")}'
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
            date_range=date_range,
            previous_week_data=previous_week_data,
            next_week_data=next_week_data
        )
