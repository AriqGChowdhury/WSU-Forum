from django.urls import path
from . import views

urlpatterns = [
    #Registration
    path('register', views.UserRegistrationViews.as_view(), name='register'),
    #Login
    path('login', views.UserLoginViews.as_view(), name='login'),
    #Delete Account
    path('delete', views.DeleteAccountViews.as_view(), name='delete'),
    #Reset Password
    path('reset', views.RequestResetView.as_view(), name='reset'),
    #Homepage
    path('posts', views.AllPostsViews.as_view(), name='post'),
    #Search tab (in homepage)
    path('search', views.SearchViews.as_view(), name='search'),
    #Settings
    path('settings', views.SettingsViews.as_view(), name='settings'),
    #Profile
    path('profile', views.ProfileViews.as_view(), name='profile'),
    #View someone elses profile
    path('profile/<int:user_id>', views.ProfileViews.as_view(), name='nonself_profile'),
    #Delete a post
    path('delete/post/<int:post_id>', views.DeletePostViews.as_view(), name='delete_post'),
    #Follow/unfollow a user
    path('follow/<int:user_id>', views.FollowViews.as_view(), name='follow'),
    #Like/unlike a post
    path('<int:post_id>/likes', views.PostLikeView.as_view(), name='like'),
    #Comment or delete comment on a post
    path('<int:post_id>/comments', views.PostCommentView.as_view(), name='comment'),
    #View a single post in detail
    path('posts/<int:post_id>', views.SinglePostViews.as_view(), name='singlePost'),
    #New user activation
    path('activate/<uidb64>/<token>', views.ActivateAccount.as_view(), name='activate'),
    #Save post
    path('<int:post_id>/save', views.SavePostViews.as_view(), name='save'),

    #Subforum URLS
    path('subforums', views.SubforumViews.as_view(), name='subforums'),
    path('subforums/trending', views.TrendingSubforumsViews.as_view(), name='trending_subforums'),
    path('subforums/tags', views.SubforumTagsViews.as_view(), name='subforum_tags'),
    path('subforums/<int:subforum_id>', views.SingleSubforumViews.as_view(), name='single_subforum'),
    path('subforums/<int:subforum_id>/posts', views.SubforumPostsViews.as_view(), name='subforum_posts'),
    path('subforums/<int:subforum_id>/subscribe', views.SubforumSubscriptionViews.as_view(), name='subscribe_subforum'),
    path('subforums/<int:subforum_id>/report', views.SubforumReportViews.as_view(), name='report_subforum'),
    path('subforums/<int:subforum_id>/moderators', views.ModeratorManagementViews.as_view(), name='subforum_moderators'),
    path('subforums/activate/<uidb64>/<token>', views.ActivateSubforum.as_view(), name='activate_subforum'),

    # Admin URLs
    path('admin/subforums/pending', views.AdminSubforumApprovalViews.as_view(), name='pending_subforums'),
    path('admin/subforums/<int:subforum_id>/approve', views.AdminSubforumApprovalViews.as_view(), name='approve_subforum'),
]
