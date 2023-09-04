from core.services.get_week_info import GetWeekInfo


def get_weeks_list_info():
    week_6 = GetWeekInfo().execute()
    week_5 = GetWeekInfo(
        week=str(week_6.previous_week_data['week']),
        year=str(week_6.previous_week_data['year']),
    ).execute()
    week_4 = GetWeekInfo(
        week=str(week_5.previous_week_data['week']),
        year=str(week_5.previous_week_data['year']),
    ).execute()
    week_3 = GetWeekInfo(
        week=str(week_4.previous_week_data['week']),
        year=str(week_4.previous_week_data['year']),
    ).execute()
    week_2 = GetWeekInfo(
        week=str(week_3.previous_week_data['week']),
        year=str(week_3.previous_week_data['year']),
    ).execute()
    week_1 = GetWeekInfo(
        week=str(week_2.previous_week_data['week']),
        year=str(week_2.previous_week_data['year']),
    ).execute()
    return [
        week_6,
        week_5,
        week_4,
        week_3,
        week_2,
        week_1,
    ]
