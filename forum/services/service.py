from .notifications import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from forum.models import *
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count

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
        subforums = self.__search_subforums()
        return {"People": people, "Posts": posts, "Subforums": subforums}

    
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
    
    def __search_subforums(self):
        return Subforum.objects.filter(name__icontains=self.__data)


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
    def get_role_for_update(self):
        role = self.__get_role()
        if type(role[0]) == Student:
            return "student"
        elif type(role[0]) == Faculty:
            return "Faculty"

    def get_profile(self):
        role = self.__get_role()
        return self.__get_settings(role)

    def update_profile(self):
        return self.__get_role()[0]

    #Private
    def __get_role(self):
        students = Student.objects.filter(user=self.__user)
        faculty = Faculty.objects.filter(user=self.__user)
        if students:
            return students
        elif faculty:
            return faculty

    def __get_settings(self, role):
        
        if type(role[0]) == Student:
            if role[0].profile_picture:
                profile_pic = role[0].profile_picture
            else:
                profile_pic = ""
            info = {
                "Bio": role[0].bio, 
                "Profile_Picture": profile_pic,
                "Major": role[0].major,
                "Class": role[0].classification
            }
            return info
        elif type(role[0]) == Faculty:
            if role[0].profile_picture:
                profile_pic = role[0].profile_picture
            else:
                profile_pic = ""
            info = {
                "Bio": role[0].bio, 
                "Profile_Picture": profile_pic,
                "Department": role[0].department
            }
            return info
        
class LikeService:
    def __init__(self, user, post_id):
        self.__user = user
        self.__postID = post_id
    
    def like_post(self):
        return self.__send_like()
    
    def __send_like(self):
        like, created = Likes.objects.get_or_create(post_id=self.__postID, user=self.__user)
        print("liked: ", like)
        print("created: ", created)
        if not created:
            like.delete()
            return False
        return True
    
class CommentService:
    def __init__(self, user, post_id, comment_id):
        self.__user = user
        self.__postID = post_id
        self.__commentID = comment_id

    def delete(self):
        return self.__delete_comment()
    
    def __delete_comment(self):
        comment = get_object_or_404(Comments, id=self.__commentID)
        if comment:
            comment.delete()
            return True
        return False
        
class SinglePostService:
    def __init__(self, post_id):
        self.__postID = post_id

    def get_post(self):
        return self.__get_singlePost()
    
    def __get_singlePost(self):
        post = get_object_or_404(Post, id=self.__postID)
        return post
    
class SaveService:
    def __init__(self, user, post_id):
        self.__user = user
        self.__postID = post_id

    def save(self):
        return self.__save()

    def __save(self):
        saved, created = SavePost.objects.get_or_create(post_id=self.__postID, user=self.__user)
        if not created:
            saved.delete()
            return False
        return True
    
class FollowService:
    def __init__(self, user, user_id):
        self.__follower = user
        self.__following = User.objects.get(id=user_id)

    def follow(self):
        if self.__error_check():
            return "Error"
        return self.__follow()
    
    def __error_check(self):
        if self.__follower == self.__following:
            return True
        return False
        
    def __follow(self):
        follow, created = FollowPerson.objects.get_or_create(follower=self.__follower, following=self.__following)
        if not created:
            follow.delete()
            return False
        return True
    
class ProfileService:
    def __init__(self, user, saved):
        self.__saved = saved
        self.__user = user

    def get_profile(self):
        return self.__get_profile()

    def __get_profile(self):
        saved_posts = None
        posts = Post.objects.filter(user=self.__user)
        commented_on = Comments.objects.filter(user=self.__user)
        if self.__saved:
            saved_posts = SavePost.objects.filter(user=self.__user)
        following = FollowPerson.objects.filter(follower=self.__user)
        follower = FollowPerson.objects.filter(following=self.__user)
        return [posts, commented_on, saved_posts, following, follower]
    
    def delete(self, id):
        return self.__delete(id)
        
    def __delete(self):
        post = get_object_or_404(Post, id=id, user=self.__user)
        if post:
            post.delete()
            return True
        return False
    
class SubforumService:
    def __init__(self, subforum_id):
        self.__subforumID = subforum_id

    def update_statistics(self):
        return self.__update_statistics()
    
    def __update_statistics(self):
        try:
            subforum = Subforum.objects.get(id=self.__subforumID)
        except:
            return None
        
        stats,_ = SubforumStat.objects.get_or_create(subforum=subforum)
        now = timezone.now()
        today = now.replace(hour=0,minute=0,second=0,microsecond=0)
        week = now - timedelta(days=7)

        posts = Post.objects.filter(subforum=subforum)
        stats.posts_today = posts.filter(created_at__gte=today).count()
        stats.posts_this_week = posts.filter(created_at__gte=week).count()
        stats.total_posts = posts.count()

        comments = Comments.objects.filter(post__subforum=subforum)
        stats.comments_today = comments.filter(created_at__gte=today).count()
        stats.total_comments = comments.count()

        active_users = (comments.filter(created_at__gte=week).values("user").distinct().count())
        stats.active_users_this_week = active_users

        stats.save()
        return stats
