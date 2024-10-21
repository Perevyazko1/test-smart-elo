from datetime import datetime, timedelta, date
import locale
import calendar
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
    earned: str = "0"


class GetWeekInfo:
    def __init__(self, week: str = None, year: str = None):
        self.week = week
        self.year = year

    def _get_initial_values(self):
        if not self.week or not self.week.isdigit():
            self.week = str(datetime.today().isocalendar()[1])

        if not self.year or not self.year.isdigit():
            self.year = str(datetime.now().year)

    def execute(self) -> WeekInfo:
        self._get_initial_values()

        str_week = f'{self.year}-{self.week}-1'
        first_day = datetime.strptime(str_week, "%G-%V-%u")

        str_dates = []
        dt_dates = []
        for day in range(7):
            str_dates.append((first_day + timedelta(days=day)).strftime('%d.%m'))
            dt_dates.append(first_day + timedelta(days=day))

        range_first = dt_dates[0]
        range_last = dt_dates[-1]
        date_range = [range_first, range_last]

        prev_week = (first_day - timedelta(days=7)).isocalendar()[1]
        prev_week_year = (first_day - timedelta(days=7)).isocalendar()[0]
        next_week = (first_day + timedelta(days=7)).isocalendar()[1]
        next_week_year = (first_day + timedelta(days=7)).isocalendar()[0]

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


class GetDateRangeInfo:
    def __init__(self, start_date: str | date = None, end_date: str | date = None):
        self.start_date_str = start_date if isinstance(start_date, str) else None
        self.end_date_str = end_date if isinstance(end_date, str) else None

        self.start_date_dt = start_date if isinstance(start_date, date) else None
        self.end_date_dt = end_date if isinstance(end_date, date) else None
        self.delta_days = 7
        self.range_type = ""
        self.range_value = ""
        self._get_initial_values()
        self._init_range_type()
        self._init_range_value()

    def _parse_date(self, date_str) -> date:
        return datetime.strptime(date_str, '%Y-%m-%d').date()

    def _init_procedure(self):
        if not self.start_date_dt or not self.end_date_dt:
            today = datetime.today().date()
            start_of_week = today - timedelta(days=today.weekday())
            self.start_date_dt = start_of_week
            self.end_date_dt = start_of_week + timedelta(days=6)

    def _get_initial_values(self):
        # Если не переданы даты - то устанавливаем начало и конец текущей недели
        if not self.start_date_str or not self.end_date_str:
            self._init_procedure()
        else:
            try:
                self.start_date_dt = self._parse_date(self.start_date_str)
                self.end_date_dt = self._parse_date(self.end_date_str)
                delta_days = (self.end_date_dt - self.start_date_dt).days + 1
                if delta_days > 0:
                    self.delta_days = delta_days
                else:
                    self._init_procedure()
            except Exception as e:
                print(e)
                self._init_procedure()

    def _init_range_type(self):
        if self.delta_days == 7:
            if self.start_date_dt.weekday() == 0 and self.end_date_dt.weekday() == 6:
                self.range_type = "Неделя"
            else:
                self.range_type = "Польз."
        elif 28 <= self.delta_days <= 31:
            if self.start_date_dt.day == 1:
                _, last_day = calendar.monthrange(self.end_date_dt.year, self.end_date_dt.month)
                if self.end_date_dt.day == last_day:
                    self.range_type = "Месяц"
                else:
                    self.range_type = "Польз."
        else:
            self.range_type = "Польз."

    def _init_range_value(self):
        if self.range_type == "Неделя":
            self.range_value = str(self.start_date_dt.isocalendar()[1])
        elif self.range_type == "Месяц":
            locale.setlocale(locale.LC_ALL, 'ru_RU.UTF-8')
            self.range_value = calendar.month_name[self.start_date_dt.month]
        else:
            self.range_value = ""

    def _get_next_range(self, is_next: bool):
        if self.range_type == "Месяц":
            if is_next:
                year = self.start_date_dt.year
                month = self.start_date_dt.month + 1
                if month == 13:
                    month = 1
                    year += 1
                start_of_month = datetime(year, month, 1)

                # Количество дней в предыдущем месяце
                _, last_day = calendar.monthrange(year, month)

                end_of_month = datetime(year, month, last_day)

            else:
                year = self.start_date_dt.year
                month = self.start_date_dt.month - 1
                if month == 0:
                    month = 12
                    year -= 1
                start_of_month = datetime(year, month, 1)

                # Количество дней в предыдущем месяце
                _, last_day = calendar.monthrange(year, month)

                end_of_month = datetime(year, month, last_day)

            return {
                "start_date": start_of_month.date(),
                "end_date": end_of_month.date(),
            }
        else:
            if is_next:
                first_day = self.end_date_dt + timedelta(days=1)
                last_day = self.end_date_dt + timedelta(days=self.delta_days)
            else:
                first_day = self.start_date_dt - timedelta(days=self.delta_days)
                last_day = self.start_date_dt - timedelta(days=1)

            return {
                "start_date": first_day,
                "end_date": last_day,
            }

    def get_range_info(self):
        return {
            "date_range": {
                "start_date": self.start_date_dt,
                "end_date": self.end_date_dt,
            },
            "previous_range": self._get_next_range(False),
            "next_range": self._get_next_range(True),
            "range_type": self.range_type,
            "range_value": self.range_value,
        }
