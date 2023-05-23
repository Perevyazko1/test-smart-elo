def in_work_view_mode_filter(queryset, pin_code, view_mode, department_number):
    if len(view_mode) == 6:
        pin_code = view_mode
        queryset = queryset.filter(
            assignments__executor__pin_code=pin_code,
            assignments__department__number=department_number,
            assignments__status='in_work',
        ).distinct()

    if view_mode == '0':
        queryset = queryset.filter(
            assignments__executor__pin_code=pin_code,
            assignments__department__number=department_number,
            assignments__status='in_work',
        ).distinct()

    if view_mode == '1':
        queryset = queryset.filter(
            assignments__department__number=department_number,
            assignments__status='in_work',
        ).distinct()

    if view_mode == '2':
        queryset = queryset.filter(
            assignments__status='in_work',
            assignments__department__number=department_number,
        ).distinct()

    return queryset.order_by('urgency')
