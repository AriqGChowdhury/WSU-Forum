from .notifications import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from forum.models import *
from django.db.models import Q

class RegisterService:
    def __init__(self, validated_data):
        self.__validated_data = dict(validated_data)

    #public
    def register_user(self):
        user = self.__create()
        self.__role(user)
        self.__send_email_verification(user)

    #private
    def __role(self, user):
        print(self.__validated_data['role'])
        if self.__validated_data['role'].lower() == "student":
            Student.objects.create(user=user, major=self.__validated_data['major'], classification=self.__validated_data['classification'])
        elif self.__validated_data['role'].lower() == "faculty":
            Faculty.objects.create(user=user, department=self.__validated_data['department'])

    def __create(self):
        self.__validated_data.pop("pass2", None)
        print(self.__validated_data)
        user = User.objects.create_user(
            username=self.__validated_data['username'],
            email=self.__validated_data['email'],
            password=self.__validated_data['password'],
            is_active=False
        )
        return user
    
    def __send_email_verification(self, user):
        EmailVerificationNotif.send_verification_email(user)


class LoginService:
    def __init__(self, username, password):
        self.__username = username
        self.__passwd = password
    
    #public
    def login_user(self):
        return self.__post()

    #private
    def __post(self):
        user = authenticate(username=self.__username, password=self.__passwd)
        return user


class DeleteService:
    def __init__(self, user):
        self.__user = user
    
    #public
    def delete_user(self):
        return self.__delete()
    
    #private
    def __delete(self):
        try:
            self.__user.delete()
            return True
        except User.DoesNotExist:
            return False

#Updated SearchService Class
class SearchService:
    def __init__(self, data):
        self.__data = self.__text(data)

    #public
    def search(self):
        people = self.__search_users()
        posts = self.__search_posts()
        return {"People": people, "Posts": posts}

    
    #private
    def __text(self, data):
        return data.get("searchText", "").strip()

    def __search_users(self):
        return User.objects.filter(username__icontains=self.__data)

    def __search_posts(self):
        return Post.objects.filter(
            Q(title__icontains=self.__data) |
            Q(body__icontains=self.__data) |
            Q(user__username__icontains=self.__data)
        )


class ResetPassService:
    def __init__(self, newPass, user):
        self.__newPass = newPass
        self.__user = user

    #Public
    def post(self):
        self.__reset_password()

    #Private
    def __reset_password(self):
        self.__user.set_password(self.__newPass)
        self.__user.save()


class SettingsService:
    def __init__(self, user):
        self.__user = user

    #Public
    def get_profile(self):
        return self.__get_settings()

    def update_profile(self):
        pass

    #Private
    def __update_settings(self):
        pass


    def __get_settings(self):
        students = Student.objects.filter(user=self.__user)
        faculty = Faculty.objects.filter(user=self.__user)
        if students:
            if students[0].profile_picture:
                profile_pic = students[0].profile_picture
            else:
                profile_pic = ""
            info = {
                "Bio": students[0].bio, 
                "Profile_Picture": profile_pic,
                "Major": students[0].major,
                "Class": students[0].classification
            }
            return info
        elif faculty:
            if faculty[0].profile_picture:
                profile_pic = students[0].profile_picture
            else:
                profile_pic = ""
            info = {
                "Bio": faculty[0].bio, 
                "Profile_Picture": profile_pic,
                "Department": faculty[0].department
            }
            return info