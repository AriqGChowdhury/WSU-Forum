from django.contrib import admin
from django.utils import timezone
from .models import (
    Subforum, SubforumTag, SubforumModerator, SubforumReport,
    SubforumSubscription, SubforumStat, Post, Comments, Likes, SavePost
)

#register models here

@admin.register(Subforum)
class SubforumAdmin(admin.ModelAdmin):
    list_display = ['name', 'creator', 'status', 'post_count', 'subscriber_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'description']
    actions = ['approve_selected', 'reject_selected']
    
    def approve_selected(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f"{queryset.count()} subforums approved.")
    approve_selected.short_description = "Approve selected subforums"
    
    def reject_selected(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} subforums rejected.")
    reject_selected.short_description = "Reject selected subforums"

@admin.register(SubforumTag)
class SubforumTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']
    search_fields = ['name']

@admin.register(SubforumModerator)
class SubforumModeratorAdmin(admin.ModelAdmin):
    list_display = ['subforum', 'user', 'role', 'assigned_by', 'assigned_at']
    list_filter = ['role', 'assigned_at']

@admin.register(SubforumReport)
class SubforumReportAdmin(admin.ModelAdmin):
    list_display = ['subforum', 'reporter', 'reason', 'status', 'created_at']
    list_filter = ['status', 'reason', 'created_at']
    actions = ['mark_as_resolved', 'mark_as_dismissed']
    
    def mark_as_resolved(self, request, queryset):
        queryset.update(status='resolved', reviewed_by=request.user, reviewed_at=timezone.now())
        self.message_user(request, f"{queryset.count()} reports marked as resolved.")
    mark_as_resolved.short_description = "Mark selected reports as resolved"
    
    def mark_as_dismissed(self, request, queryset):
        queryset.update(status='dismissed', reviewed_by=request.user, reviewed_at=timezone.now())
        self.message_user(request, f"{queryset.count()} reports marked as dismissed.")
    mark_as_dismissed.short_description = "Mark selected reports as dismissed"

@admin.register(SubforumSubscription)
class SubforumSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'subforum', 'created_at']
    list_filter = ['created_at']

@admin.register(SubforumStat)
class SubforumStatAdmin(admin.ModelAdmin):
    list_display = ['subforum', 'posts_today', 'active_users_this_week', 'updated_at']
    readonly_fields = ['updated_at']

admin.site.register(Post)
admin.site.register(Comments)
admin.site.register(Likes)
admin.site.register(SavePost)