from django.contrib import admin

from .models import Task, TaskImage, TaskViewInfo, TaskComment


class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'status', 'urgency', 'view_mode', 'for_department',
        'title', 'description', 'deadline', 'created_at', 'appointed_at', 'created_by', 'ready_at',
        'verified_at', 'appointed_by', 'executor', 'get_co_executors',
    ]
    readonly_fields = ['created_at']

    def get_co_executors(self, obj):
        return ", ".join([str(executor) for executor in obj.co_executors.all()])
    get_co_executors.short_description = 'Соисполнители'

    get_co_executors.short_description = 'Соисполнители'


admin.site.register(Task, TaskAdmin)
admin.site.register(TaskImage)
admin.site.register(TaskViewInfo)
admin.site.register(TaskComment)
