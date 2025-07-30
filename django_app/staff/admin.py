from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from rangefilter.filters import DateRangeFilter

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import Employee, Department, Transaction, Audit


class CustomUserAdmin(UserAdmin):
    """Переопределяем стандартную форму пользователя"""
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = Employee
    list_display = [
        'username',
        'first_name',
        "last_name",
        'pin_code',
        'permanent_department',
        'kpd',
    ]
    list_display_links = ['username']

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        # Добавлены пин-код и отделы
        (_("Personal info"), {"fields": (
            "first_name",
            "last_name",
            "patronymic",
            "email",
            'pin_code',
            'boss',
            'kpd',
            'departments',
            'current_department',
            'permanent_department')
        }),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )


admin.site.register(Employee, CustomUserAdmin)

admin.site.register(Department)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'add_date',
        'transaction_type',
        'details',
        'amount',
        'employee',
        'inspector',
    ]

    list_filter = [
        ('add_date', DateRangeFilter),
        ('target_date', DateRangeFilter),
        'employee',
        'executor',
        'inspector'
    ]

    search_fields = ['description']


@admin.register(Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = ['date', 'employee', 'short_detail']

    list_filter = [
        ('date', DateRangeFilter),
        'employee',
        'date'
    ]

    search_fields = ['details', 'employee__first_name', 'employee__last_name']

    def short_detail(self, obj):
        # обрезаем детали до 100 символов для отображения в списке
        return obj.details[:100]

    short_detail.short_description = 'Short Details'
