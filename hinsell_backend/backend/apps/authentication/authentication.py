from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework import exceptions

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            header = self.get_header(request)
            if header:
                raw_token = self.get_raw_token(header)
            else:
                raw_token = request.COOKIES.get(settings.AUTH_COOKIE)
            if raw_token is None:
                return None
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
            
        except InvalidToken as e:
            raise exceptions.AuthenticationFailed('Invalid token') from e
        except AuthenticationFailed as e:
            raise exceptions.AuthenticationFailed('Authentication failed') from e
        except Exception as e:
            raise exceptions.AuthenticationFailed('Authentication error occurred') from e