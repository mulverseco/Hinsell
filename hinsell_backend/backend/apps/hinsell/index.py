import algoliasearch_django as algoliasearch

from apps.hinsell.models import Offer,Coupon,UserCoupon,Campaign

algoliasearch.register(Offer)
algoliasearch.register(Coupon)
algoliasearch.register(UserCoupon)
algoliasearch.register(Campaign)