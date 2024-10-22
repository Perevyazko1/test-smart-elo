from datetime import date

from core.services.get_week_info import GetDateRangeInfo


def get_range_info(start_date: str | date = None, end_date: str | date = None):
    range_data = {"I": GetDateRangeInfo(start_date, end_date).get_range_info()}
    range_data["II"] = GetDateRangeInfo(**range_data["I"]["previous_range"]).get_range_info()
    range_data["III"] = GetDateRangeInfo(**range_data["II"]["previous_range"]).get_range_info()

    return range_data
