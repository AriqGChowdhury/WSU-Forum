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
class UserRegistrationViews(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(request.data)
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            RegisterService.create(serializer.validated_data)
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
        user = LoginService.post(username = request.data['username'], password = request.data['password'])
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
            ResetPassService.post(user=request.user, newPass=serializer.validated_data['newPassword'])
        return Response({"message": "Password changed"}, status=status.HTTP_200_OK)
    
#Delete Account
class DeleteAccountViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request):
        deleteAccount = DeleteService.delete(request.user)
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

# work on likes, comments, bio, profile pic, subspaces, etc