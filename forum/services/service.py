from .notifications import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from forum.models import *
from django.db.models import Q
class RegisterService:
    def create(validated_data):
        validated_data.pop("pass2", None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=False
        )
        EmailVerificationNotif.send_verification_email(user)
        return user
    

class LoginService:
    def post(username, password):
        user = authenticate(username=username, password=password)
        return user


class DeleteService:
    def delete(user):
        try:
            user.delete()
            return True
        except user.DoesNotExist:
            return False
        
class SearchService:
    def get(data):
        data = data['searchText']
        searchPpl = User.objects.all().filter(username__icontains=data)
        searchPosts = Post.objects.all().filter(
            Q(title__icontains=data) | 
            Q(body__icontains=data) | 
            Q(user__username__icontains=data)
        )
        return {"People": searchPpl, "Posts": searchPosts}
        #search topics when you create subspaces

class ResetPassService:
    def post(user, newPass):
        user.set_password(newPass)
        user.save()