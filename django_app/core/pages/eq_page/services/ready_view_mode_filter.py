def ready_view_mode_filter(queryset, pin_code, view_mode, department_number, week_info):
    if len(view_mode) == 6:
        pin_code = view_mode
        queryset = queryset.filter(
            assignments__executor__pin_code=pin_code,
            assignments__department__number=department_number,
            assignments__status='ready',
            assignments__date_completion__gt=week_info.date_range[0],
            assignments__date_completion__lte=week_info.date_range[1],
        ).distinct().order_by('-assignments__inspector')

    if view_mode == '0':
        queryset = queryset.filter(
            assignments__executor__pin_code=pin_code,
            assignments__department__number=department_number,
            assignments__status='ready',
            assignments__date_completion__gt=week_info.date_range[0],
            assignments__date_completion__lte=week_info.date_range[1],
        ).distinct().order_by('-assignments__inspector')

    if view_mode == '1':
        queryset = queryset.filter(
            assignments__department__number=department_number,
            assignments__status='ready',
            assignments__date_completion__gt=week_info.date_range[0],
            assignments__date_completion__lte=week_info.date_range[1],
        ).distinct().order_by('-assignments__inspector')

    if view_mode == '2':
        queryset = queryset.filter(
            assignments__department__number=department_number,
            assignments__status='ready',
            assignments__inspector__isnull=True
        ).distinct()

    return queryset
