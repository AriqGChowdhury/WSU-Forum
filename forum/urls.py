from django.urls import path
from . import views

urlpatterns = [
    path('register', views.UserRegistrationViews.as_view(), name='register'),
    path('login', views.UserLoginViews.as_view(), name='login'),
    path('delete', views.DeleteAccountViews.as_view(), name='delete'),
    path('reset', views.RequestResetView.as_view(), name='reset'),
    path('posts', views.AllPostsViews.as_view(), name='post'),
    path('search', views.SearchViews.as_view(), name='search'),
    path('settings', views.SettingsViews.as_view(), name='settings'),
    path('profile', views.ProfileViews.as_view(), name='profile'),
    path('<int:post_id>/likes', views.PostLikeView.as_view(), name='like'),
    path('<int:post_id>/comments', views.PostCommentView.as_view(), name='comment'),
    path('<int:post_id>', views.SinglePostViews.as_view(), name='singlePost'),
    path('activate/<uidb64>/<token>', views.ActivateAccount.as_view(), name='activate'),
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

