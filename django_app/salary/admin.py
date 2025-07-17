from django.contrib import admin
from .models import Payroll, PayrollRow, Earning


admin.site.register(Payroll)
admin.site.register(PayrollRow)
admin.site.register(Earning)