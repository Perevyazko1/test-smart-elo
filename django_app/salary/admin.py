from django.contrib import admin
from rangefilter.filters import DateRangeFilter

from .models import Payroll, PayrollRow, Earning

admin.site.register(Payroll)
admin.site.register(PayrollRow)


class EarningAdmin(admin.ModelAdmin):
    search_fields = ['comment']
    list_display = ['user', 'target_date', 'amount', 'earning_type', 'comment']

    list_filter = [
        ('target_date', DateRangeFilter),
        'user',
        'target_date'
    ]


admin.site.register(Earning, EarningAdmin)
