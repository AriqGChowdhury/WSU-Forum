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
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

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
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"message": "post created"},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"Error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def get(self, request):
        """Get all posts, optionally filtered by subforum"""
        subforum_id = request.query_params.get('subforum')
        subscribed_only = request.query_params.get('subscribed') == 'true'
        
        posts = Post.objects.all()
        
        # Filter by subforum
        if subforum_id:
            if subforum_id == 'general':
                posts = posts.filter(subforum__isnull=True)
            else:
                posts = posts.filter(subforum_id=subforum_id)
        
        # Filter by subscribed subforums
        elif subscribed_only:
            subscribed_ids = SubforumSubscription.objects.filter(
                user=request.user
            ).values_list('subforum_id', flat=True)
            posts = posts.filter(subforum_id__in=subscribed_ids)
        
        posts = posts.order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
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

# SUBFORUM VIEWS

class SubforumViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        """Get all approved subforums with optional filtering"""
        status_filter = request.query_params.get('status', 'approved')
        tag_filter = request.query_params.get('tag')
        search_query = request.query_params.get('search')
        
        subforums = Subforum.objects.all()
        
        # Filter by status (admin can see all, users only approved)
        if not request.user.is_staff:
            subforums = subforums.filter(status='approved')
        elif status_filter:
            subforums = subforums.filter(status=status_filter)
        
        # Filter by tag
        if tag_filter:
            subforums = subforums.filter(tags__id=tag_filter)
        
        # Search
        if search_query:
            subforums = subforums.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        # Order by popularity
        order_by = request.query_params.get('order_by', 'post_count')
        if order_by in ['post_count', 'subscriber_count', 'created_at']:
            subforums = subforums.order_by(f'-{order_by}')
        
        serializer = SubforumSerializer(subforums, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new subforum (requires admin approval)"""
        serializer = SubforumCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            subforum = serializer.save()
            
            # Send notification to admins (you'll implement this)
            # NotificationService.notify_admins_subforum_pending(subforum)
            
            return Response(
                SubforumSerializer(subforum, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SingleSubforumViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, subforum_id):
        """Get subforum details"""
        try:
            subforum = Subforum.objects.get(id=subforum_id)
            
            # Check if user can view (approved or user is moderator/admin)
            if subforum.status != 'approved' and not (
                request.user.is_staff or
                subforum.moderators.filter(user=request.user).exists()
            ):
                return Response(
                    {'error': 'Subforum not found or not approved'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = SubforumSerializer(subforum, context={'request': request})
            
            # Get statistics
            stats = SubforumService.update_statistics(subforum_id)
            
            response_data = serializer.data
            if stats:
                response_data['statistics'] = {
                    'posts_today': stats.posts_today,
                    'posts_this_week': stats.posts_this_week,
                    'active_users_this_week': stats.active_users_this_week,
                    'total_posts': stats.total_posts,
                    'total_comments': stats.total_comments,
                }
            
            return Response(response_data)
            
        except Subforum.DoesNotExist:
            return Response(
                {'error': 'Subforum not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SubforumPostsViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, subforum_id):
        """Get all posts in a subforum"""
        try:
            subforum = Subforum.objects.get(id=subforum_id, status='approved')
            posts = subforum.posts.all().order_by('-created_at')
            
            # Pagination
            page = request.query_params.get('page', 1)
            per_page = request.query_params.get('per_page', 20)
            
            paginator = Paginator(posts, per_page)
            try:
                posts_page = paginator.page(page)
            except PageNotAnInteger:
                posts_page = paginator.page(1)
            except EmptyPage:
                posts_page = paginator.page(paginator.num_pages)
            
            serializer = PostSerializer(posts_page, many=True, context={'request': request})
            
            return Response({
                'subforum': SubforumSerializer(subforum, context={'request': request}).data,
                'posts': serializer.data,
                'page': posts_page.number,
                'total_pages': paginator.num_pages,
                'total_posts': paginator.count
            })
            
        except Subforum.DoesNotExist:
            return Response(
                {'error': 'Subforum not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SubforumSubscriptionViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request, subforum_id):
        """Subscribe to a subforum"""
        try:
            subforum = Subforum.objects.get(id=subforum_id, status='approved')
            
            subscription, created = SubforumSubscription.objects.get_or_create(
                user=request.user,
                subforum=subforum,
                defaults={'receive_notifications': True}
            )
            
            if created:
                # Update subscriber count
                subforum.subscriber_count += 1
                subforum.save()
                
                return Response(
                    {'message': 'Subscribed to subforum'},
                    status=status.HTTP_201_CREATED
                )
            return Response(
                {'message': 'Already subscribed'},
                status=status.HTTP_200_OK
            )
            
        except Subforum.DoesNotExist:
            return Response(
                {'error': 'Subforum not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, subforum_id):
        """Unsubscribe from a subforum"""
        try:
            subscription = SubforumSubscription.objects.get(
                user=request.user,
                subforum_id=subforum_id
            )
            subscription.delete()
            
            # Update subscriber count
            subforum = subscription.subforum
            subforum.subscriber_count = max(0, subforum.subscriber_count - 1)
            subforum.save()
            
            return Response(
                {'message': 'Unsubscribed from subforum'},
                status=status.HTTP_200_OK
            )
        except SubforumSubscription.DoesNotExist:
            return Response(
                {'error': 'Subscription not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SubforumReportViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request, subforum_id):
        """Report a subforum"""
        try:
            subforum = Subforum.objects.get(id=subforum_id, status='approved')
            
            # Check if user already reported
            existing_report = SubforumReport.objects.filter(
                subforum=subforum,
                reporter=request.user,
                status='pending'
            ).exists()
            
            if existing_report:
                return Response(
                    {'error': 'You already have a pending report for this subforum'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = SubforumReportSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save(subforum=subforum)
                
                # Notify moderators and admins
                # NotificationService.notify_moderators_subforum_reported(subforum, request.user)
                
                return Response(
                    {'message': 'Report submitted successfully'},
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Subforum.DoesNotExist:
            return Response(
                {'error': 'Subforum not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class ModeratorManagementViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, subforum_id):
        """Get all moderators for a subforum (moderators/admins only)"""
        try:
            subforum = Subforum.objects.get(id=subforum_id)
            
            # Check permissions
            if not (request.user.is_staff or 
                   subforum.moderators.filter(user=request.user).exists()):
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            moderators = subforum.moderators.all()
            serializer = ModeratorSerializer(moderators, many=True)
            return Response(serializer.data)
            
        except Subforum.DoesNotExist:
            return Response(
                {'error': 'Subforum not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, subforum_id):
        """Add a moderator (creator/admins only)"""
        try:
            subforum = Subforum.objects.get(id=subforum_id)
            
            # Check if user is creator or admin
            is_creator = subforum.moderators.filter(
                user=request.user,
                role='creator'
            ).exists()
            
            if not (request.user.is_staff or is_creator):
                return Response(
                    {'error': 'Only the creator or admin can add moderators'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user_id = request.data.get('user_id')
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already moderator
            if subforum.moderators.filter(user=user).exists():
                return Response(
                    {'error': 'User is already a moderator'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create moderator
            moderator = SubforumModerator.objects.create(
                subforum=subforum,
                user=user,
                assigned_by=request.user,
                role=request.data.get('role', 'moderator'),
                can_delete_posts=request.data.get('can_delete_posts', True),
                can_ban_users=request.data.get('can_ban_users', False),
                can_edit_rules=request.data.get('can_edit_rules', False)
            )
            
            serializer = ModeratorSerializer(moderator)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Subforum.DoesNotExist:
            return Response(
                {'error': 'Subforum not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class AdminSubforumApprovalViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_permissions(self):
        """Only staff/admin can access"""
        if self.request.method in ['GET', 'POST', 'PUT']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get(self, request):
        """Get pending subforums for approval"""
        pending_subforums = Subforum.objects.filter(status='pending')
        serializer = SubforumSerializer(pending_subforums, many=True, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request, subforum_id):
        """Approve or reject a subforum"""
        try:
            subforum = Subforum.objects.get(id=subforum_id)
            action = request.data.get('action')
            reason = request.data.get('reason', '')
            
            if action == 'approve':
                subforum.status = 'approved'
                subforum.save()
                
                # Notify creator
                # NotificationService.notify_user_subforum_approved(subforum.creator, subforum)
                
                return Response(
                    {'message': 'Subforum approved successfully'},
                    status=status.HTTP_200_OK
                )
            
            elif action == 'reject':
                subforum.status = 'rejected'
                subforum.save()
                
                # Notify creator with reason
                # NotificationService.notify_user_subforum_rejected(subforum.creator, subforum, reason)
                
                return Response(
                    {'message': 'Subforum rejected'},
                    status=status.HTTP_200_OK
                )
            
            else:
                return Response(
                    {'error': 'Invalid action. Use "approve" or "reject"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Subforum.DoesNotExist:
            return Response(
                {'error': 'Subforum not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class TrendingSubforumsViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        """Get trending subforums"""
        trending = SubforumService.get_trending_subforums(limit=10)
        serializer = SubforumSerializer(trending, many=True, context={'request': request})
        return Response(serializer.data)

class SubforumTagsViews(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        """Get all subforum tags"""
        tags = SubforumTag.objects.all()
        serializer = SubforumTagSerializer(tags, many=True)
        return Response(serializer.data)