from django.urls import path
from . import views

urlpatterns = [
    path('',views.lobby),
    path('room/',views.room),

    path('get_token/', views.getToken),

    path('create_member/', views.createMember),
    path('get_member/', views.getMember, name="get_member"),
    path('delete_member/', views.deleteMember),
]