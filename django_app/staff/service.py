from django.contrib.auth.models import Group


def is_user_in_group(user, group_name):
    group = Group.objects.get(name=group_name)
    return group in user.groups.all()
