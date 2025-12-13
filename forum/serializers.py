from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *
from .services.service import *

class UserRegistrationSerializer(serializers.ModelSerializer):
    pass2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    email = serializers.CharField()
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'pass2']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        email_validation = attrs['email'].split("@")
        if email_validation[1] != "wayne.edu":
            raise serializers.ValidationError({"email": "Please use your email ending in wayne.edu to register successfully"})
        if attrs['password'] != attrs['pass2']:
            raise serializers.ValidationError({'password': 'password fields do not match'})
        return attrs
    
    
class PostSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = "__all__"

    def get_user(self, obj):
        return obj.user.username

class SearchSerializer(serializers.Serializer):
    searchText = serializers.CharField(max_length=100)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields =['id', 'username']

class ResetPassSerializer(serializers.Serializer):
    oldPassword = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    newPassword = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    confirm = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    
    def validate(self, attrs):
        user = self.context['request'].user        
        if not user.check_password(attrs['oldPassword']):
            raise serializers.ValidationError({"message": "Incorrect password"})
        if attrs['newPassword'] != attrs['confirm']:
            raise serializers.ValidationError({'message': "passwords do not match"})
        return attrs

class SubforumTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubforumTag
        fields = ['id', 'name', 'description', 'color']

class SubforumSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    moderators = serializers.SerializerMethodField()
    tags = SubforumTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=SubforumTag.objects.all(),
        source='tags',
        write_only=True,
        many=True,
        required=False
    )
    is_subscribed = serializers.SerializerMethodField()
    is_moderator = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Subforum
        fields = [
            'id', 'name', 'description', 'rules', 'creator', 'status',
            'banner', 'banner_url', 'created_at', 'post_count',
            'subscriber_count', 'moderators', 'tags', 'tag_ids',
            'is_subscribed', 'is_moderator'
        ]
        read_only_fields = ['creator', 'status', 'post_count', 'subscriber_count']
    
    def get_creator(self, obj):
        return {
            'id': obj.creator.id,
            'username': obj.creator.username
        }
    
    def get_moderators(self, obj):
        moderators = obj.moderators.all()[:5]  # Limit for performance
        return UserSerializer([mod.user for mod in moderators], many=True).data
    
    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.subscribers.filter(user=request.user).exists()
        return False
    
    def get_is_moderator(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.moderators.filter(user=request.user).exists()
        return False
    
    def get_banner_url(self, obj):
        if obj.banner:
            return obj.banner.url
        return None
    
    def validate_name(self, value):
        # Check for existing subforum names (case-insensitive)
        if Subforum.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A subforum with this name already exists.")
        return value

class SubforumCreateSerializer(serializers.ModelSerializer):
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=SubforumTag.objects.all(),
        source='tags',
        write_only=True,
        many=True,
        required=False
    )
    
    class Meta:
        model = Subforum
        fields = ['name', 'description', 'rules', 'banner', 'tag_ids']
        extra_kwargs = {
            'rules': {'required': False}
        }
    
    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        request = self.context.get('request')
        
        # Create subforum
        subforum = Subforum.objects.create(
            creator=request.user,
            status='pending',  # Requires admin approval
            **validated_data
        )
        
        # Add creator as moderator
        SubforumModerator.objects.create(
            subforum=subforum,
            user=request.user,
            role='creator',
            assigned_by=request.user,
            can_delete_posts=True,
            can_ban_users=True,
            can_edit_rules=True
        )
        
        # Add tags
        subforum.tags.set(tags)
        
        # Create stats entry
        SubforumStat.objects.create(subforum=subforum)
        
        return subforum

class SubforumReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    subforum_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SubforumReport
        fields = [
            'id', 'subforum', 'subforum_name', 'reporter', 'reason',
            'details', 'status', 'created_at', 'reviewed_by', 'reviewed_at'
        ]
        read_only_fields = ['reporter', 'created_at', 'reviewed_by', 'reviewed_at']
    
    def get_reporter(self, obj):
        return obj.reporter.username
    
    def get_subforum_name(self, obj):
        return obj.subforum.name
    
    def create(self, validated_data):
        request = self.context.get('request')
        return SubforumReport.objects.create(
            reporter=request.user,
            **validated_data
        )

class SubforumSubscriptionSerializer(serializers.ModelSerializer):
    subforum = SubforumSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SubforumSubscription
        fields = ['id', 'subforum', 'user', 'created_at', 'receive_notifications']
        read_only_fields = ['user', 'created_at']

class ModeratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = SubforumModerator
        fields = [
            'id', 'user', 'role', 'assigned_by', 'assigned_by_user',
            'assigned_at', 'can_delete_posts', 'can_ban_users', 'can_edit_rules'
        ]
    
    def get_assigned_by_user(self, obj):
        if obj.assigned_by:
            return obj.assigned_by.username
        return None

# Update PostSerializer to include subforum
class PostSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    subforum = SubforumSerializer(read_only=True)
    subforum_id = serializers.PrimaryKeyRelatedField(
        queryset=Subforum.objects.filter(status='approved'),
        source='subforum',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Post
        fields = "__all__"
        extra_kwargs = {
            'user': {'read_only': True}
        }
    
    def get_user(self, obj):
        return obj.user.username
    
    def create(self, validated_data):
        request = self.context.get('request')
        post = Post.objects.create(user=request.user, **validated_data)
        
        # Update subforum post count
        if post.subforum:
            post.subforum.post_count += 1
            post.subforum.save()
        
        return post