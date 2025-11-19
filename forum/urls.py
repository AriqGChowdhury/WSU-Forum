from django.urls import path
from . import views

urlpatterns = [
    path('register', views.UserRegistrationViews.as_view(), name='register'),
    path('login', views.UserLoginViews.as_view(), name='login'),
    path('delete', views.DeleteAccountViews.as_view(), name='delete'),
    path('reset', views.RequestResetView.as_view(), name='reset'),
    #Change path name to home and update views class
    path('posts', views.AllPostsViews.as_view(), name='post'),
    path('search', views.SearchViews.as_view(), name='search'),
    # ^
    path('activate/<uidb64>/<token>', views.ActivateAccount.as_view(), name='activate')
]