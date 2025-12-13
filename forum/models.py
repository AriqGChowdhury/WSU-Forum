from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator

# Create your models here.

class Subforum(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=500)
    rules = models.TextField(max_length=2000, blank=True, default="Be respectful to other members.")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_subforums')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    banner = models.ImageField(
        upload_to='subforum_banners/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistics (denormalized for performance)
    post_count = models.IntegerField(default=0)
    subscriber_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['name']
        permissions = [
            ("moderate_subforum", "Can moderate subforum content"),
        ]
    
    def __str__(self):
        return self.name

class SubforumTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True)
    color = models.CharField(max_length=7, default='#007bff')  # Hex color
    
    def __str__(self):
        return self.name

class SubforumTagging(models.Model):
    subforum = models.ForeignKey(Subforum, on_delete=models.CASCADE, related_name='tags')
    tag = models.ForeignKey(SubforumTag, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['subforum', 'tag']

class SubforumModerator(models.Model):
    ROLE_CHOICES = [
        ('creator', 'Creator (Full Permissions)'),
        ('moderator', 'Moderator'),
        ('junior_mod', 'Junior Moderator'),
    ]
    
    subforum = models.ForeignKey(Subforum, on_delete=models.CASCADE, related_name='moderators')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderated_subforums')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='moderator')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_moderators')
    assigned_at = models.DateTimeField(auto_now_add=True)
    can_delete_posts = models.BooleanField(default=True)
    can_ban_users = models.BooleanField(default=False)
    can_edit_rules = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['subforum', 'user']

class SubforumReport(models.Model):
    REPORT_CHOICES = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('rules_violation', 'Rules Violation'),
        ('inappropriate', 'Inappropriate Content'),
        ('other', 'Other'),
    ]
    
    subforum = models.ForeignKey(Subforum, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subforum_reports')
    reason = models.CharField(max_length=20, choices=REPORT_CHOICES)
    details = models.TextField(max_length=1000, blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_reports')
    reviewed_at = models.DateTimeField(null=True, blank=True)

class SubforumSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscribed_subforums')
    subforum = models.ForeignKey(Subforum, on_delete=models.CASCADE, related_name='subscribers')
    created_at = models.DateTimeField(auto_now_add=True)
    receive_notifications = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'subforum']

class SubforumStat(models.Model):
    subforum = models.OneToOneField(Subforum, on_delete=models.CASCADE, related_name='stats')
    # Daily stats
    posts_today = models.IntegerField(default=0)
    comments_today = models.IntegerField(default=0)
    new_subscribers_today = models.IntegerField(default=0)
    # Weekly stats
    posts_this_week = models.IntegerField(default=0)
    active_users_this_week = models.IntegerField(default=0)
    # All time
    total_posts = models.IntegerField(default=0)
    total_comments = models.IntegerField(default=0)
    peak_users_online = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(blank=False, max_length=75)
    body = models.CharField(blank=False, max_length=1000)
    subforum = models.ForeignKey(Subforum, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

class Comments(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.CharField(max_length=1000)
    subforum = models.ForeignKey(Subforum, on_delete=models.SET_NULL, null=True)  # For filtering by subforum
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.subforum and self.post.subforum:
            self.subforum = self.post.subforum
        super().save(*args, **kwargs)

class Likes(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SavePost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)