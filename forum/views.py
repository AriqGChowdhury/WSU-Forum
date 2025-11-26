from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .models import *
from rest_framework import status, permissions
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, JSONParser
from .services.service import *
from .services.notifications import *

## Application follows SRP from SOLID Design ## 


# Create your views here.

### Ensure users cannot register multiple accounts with same email
# Password restrictions
class UserRegistrationViews(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            register_service = RegisterService(serializer.validated_data)
            register_service.register_user()
            #Redirect to sign in after!
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#Login authentication
class UserLoginViews(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'username': request.user.username
    })

    def post(self, request):
        login_service = LoginService(username = request.data['username'], password = request.data['password'])
        user = login_service.login_user()
        if user is None or user.is_active == False:
            raise AuthenticationFailed('Invalid')
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'message': 'success',
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        )
    
#Reset Password
class RequestResetView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResetPassSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            reset_pass_service = ResetPassService(user=request.user, newPass=serializer.validated_data['newPassword'])
            reset_pass_service.post()
            return Response({"message": "Password changed"}, status=status.HTTP_200_OK)
        return Response({"Error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
#Delete Account
class DeleteAccountViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request):
        delete_service = DeleteService(request.user)
        deleteAccount = delete_service.delete_user()
        if not deleteAccount:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Account has been deleted.'}, status=status.HTTP_200_OK)
    
#Activate Account
class ActivateAccount(APIView):
    permission_classes = [AllowAny]
    def get(self, request, uidb64, token):
        activate = EmailVerificationNotif.activate(token=token, uidb64=uidb64)
        if activate:
            return Response({"message": "success"}, status=status.HTTP_200_OK)
        return Response({"Error": "Account not activated"}, status=status.HTTP_400_BAD_REQUEST)

#View all posts (tied to homepage for now) will update when subspace code is created   
class AllPostsViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message" : "post created"}, status=status.HTTP_201_CREATED)
        return Response({"Error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        all_posts = Post.objects.all()
        serializer = PostSerializer(all_posts, many=True)
        return Response(serializer.data)
    

#Click onto single post, view comments
class SinglePostViews(APIView):
    pass

#Search Bar tied to homepage
class SearchViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def post(self, request):
        serializer = SearchSerializer(data=request.data)
        if serializer.is_valid():
            search = SearchService.get(request.data)
            people = UserSerializer(search["People"], many=True).data
            posts = PostSerializer(search["Posts"], many=True).data
            return Response({
                "People": people,
                "Posts": posts
            })
        return Response({"message": "error"})
    
class SettingsViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def patch(self, request):
        update_service = SettingsService(request.user)
        role = update_service.get_role_for_update()
        model = update_service.update_profile()
        if role == "student":
            serializer = StudentSerializer(model, data=request.data, partial=True)
        elif role == "faculty":
            serializer = FacultySerializer(model, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "user has been updated"}, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


    def get(self, request):
        settings_service = SettingsService(request.user)
        info = settings_service.get_profile()
        return Response({"user": info})
    

    

# work on likes, comments on all post views and single post views next