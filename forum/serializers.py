from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *
from .services.service import *

class UserRegistrationSerializer(serializers.ModelSerializer):
    pass2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    email = serializers.CharField()
    role = serializers.CharField()
    major = serializers.CharField(allow_blank=True)
    classification = serializers.CharField(allow_blank=True)
    department = serializers.CharField(allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'pass2', 'role', 'major', 'classification', 'department']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        email_validation = attrs['email'].split("@")
        if email_validation[1] != "wayne.edu":
            raise serializers.ValidationError({"email": "Please use your email ending in wayne.edu to register successfully"})
        if attrs['password'] != attrs['pass2']:
            raise serializers.ValidationError({'password': 'password fields do not match'})
        if attrs['role'].lower() == "student":
            if attrs['major'] == "" or attrs['classification'] == "":
                raise serializers.ValidationError({"detail": "Major or classification cannot be empty"})
        if attrs['role'].lower() == "faculty":
            if attrs['department'] == "":
                raise serializers.ValidationError({"detail": "Department cannot be null"})
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
    oldPassword = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=True)
    newPassword = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=True)
    confirm = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=True)
    
    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['oldPassword']):
            raise serializers.ValidationError({"message": "Incorrect password"})
        if attrs['newPassword'] != attrs['confirm']:
            raise serializers.ValidationError({'message': "passwords do not match"})
        return attrs

class UpdateSerializer(serializers.Serializer):
    bio = models.CharField(max_length=200, blank=True)
    profile_picture = models.ImageField(blank=True)
    major = models.CharField(max_length=75)
    department = models.CharField(max_length=100)
    classification = models.CharField(max_length=20)