from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings
from ..tokens import generate_token
from django.contrib.auth.models import User
from ..models import Subforum

class EmailVerificationNotif:
    #Sends email verification for new account
    def send_verification_email(user):
        

        #Test Link
        verification_link = f"http://127.0.0.1:8000/activate/{urlsafe_base64_encode(force_bytes(user.pk))}/{generate_token.make_token(user)}"
        
        
        email_subject = "Confirm your email to access WSU Forum"
       
            
        message = f"""
            Hi, {user.username}.
            To activate your account please click the link below!\n
            {verification_link}
        """
        send_mail(
            email_subject, 
            message, 
            settings.EMAIL_HOST_USER, 
            [user.email], 
            fail_silently=True
        )
        
        
    #Activate new account
    def activate(uidb64,token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError,ValueError,OverflowError,User.DoesNotExist):
            user = None

        if user is not None and generate_token.check_token(user,token):
            user.is_active = True
            user.save()
            return True
        else:
            return False



class SubforumPendingNotif:
    #Sends email to admin to approve or reject new subforum request
    def send_email(subforum):

        #Test Link
        subforum_uid = urlsafe_base64_encode(force_bytes(subforum.id))
        verification_link = f"http://127.0.0.1:8000/subforums/activate/{subforum_uid}/{generate_token.make_token(subforum)}"
        
        
        email_subject = f"{subforum.name} is requesting approval for WSU Forum"
       
            
        message = f"""
            Hi, admin.
            To activate requested subforum press link below!\n
            {verification_link}
        """
        send_mail(
            email_subject, 
            message, 
            settings.EMAIL_HOST_USER, 
            ["hf5406@wayne.edu"], 
            fail_silently=True
        )
        
    #Activates new subforum
    def activate_subforum(uidb64, token):
        try:
            subforum_id = force_str(urlsafe_base64_decode(uidb64))
            subforum = Subforum.objects.get(id=subforum_id)
            if generate_token.check_token(subforum,token):
                subforum.status = "approved"
                subforum.save()
            return True
        except:
            return False
