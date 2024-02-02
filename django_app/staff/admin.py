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
    list_display = ['username', 'first_name', "last_name", 'pin_code']
    list_display_links = ['username']
    readonly_fields = ['current_balance']

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        # Добавлены пин-код и отделы
        (_("Personal info"), {"fields": (
            "first_name",
            "last_name",
            "patronymic",
            "email",
            'pin_code',
            'current_balance',
            'departments',
            'current_department')
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
        ('inspect_date', DateRangeFilter),
        'employee',
        'executor',
        'inspector'
    ]

    search_fields = ['description']

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.is_locked:  # если объект заблокирован для редактирования
            return [f.name for f in self.model._meta.fields]  # все поля становятся только для чтения
        return super(TransactionAdmin, self).get_readonly_fields(request, obj)


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
