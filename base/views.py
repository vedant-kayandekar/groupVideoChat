# from django.shortcuts import render
# from django.http import JsonResponse
# from agora_token_builder import RtcTokenBuilder
# import random , time
# import json
# from .models import RoomMember

# from django.views.decorators.csrf import csrf_exempt

# # Create your views here.

# def getToken(request):
#     appId = 'bb70fcdb59ee4abca8258d9dc2fc265c'
#     appCertificate = 'cd9e82ca165a46cc9ffb240ab3c419b0'
#     channelName = request.GET.get('channel')
#     uid = random.randint(1,230)
#     expirationTimeInSeconds = 3600 * 24
#     currentTimeStamp = time.time()
#     privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
#     role = 1
    
#     token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
#     return JsonResponse({'token':token,'uid':uid}, safe=False)

# def lobby(request):
#     return render(request,'base/lobby.html')

# def room(request):
#     return render(request,'base/room.html')

# @csrf_exempt
# def createMember(request):
#     data  = json.loads(request.body)

#     member, created = RoomMember.objects.get_or_create(
#        name= data['name'],
#        uid = data['UID'],
#        room_name = data['room_name'],
#     )
#     return JsonResponse({'name':data['name']},safe=False)

# def getMember(request):
#     uid = request.GET.get('uid')
#     room_name = request.GET.get('room_name')

#     member = RoomMember.objects.get(
#         uid=uid,
#         room_name=room_name,
#     )

#     name = member.name
#     return JsonResponse({'name':member.name},safe=False)

# @csrf_exempt
# def deleteMember(request):
#     data  = json.loads(request.body)

#     member = RoomMember.objects.get(
#         name=data['name'],
#         uid=data['UID'],
#         room_name=data['room_name'],
#     )
#     member.delete()

#     return JsonResponse('Member was deleted',safe=False)

from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random, time, json
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
import logging

def getToken(request):
    appId = 'bb70fcdb59ee4abca8258d9dc2fc265c'
    appCertificate = 'cd9e82ca165a46cc9ffb240ab3c419b0'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1
    
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'uid': uid}, safe=False)

def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name'],
    )
    return JsonResponse({'name': data['name']}, safe=False)

# def getMember(request):
#     uid = request.GET.get('uid')
#     room_name = request.GET.get('room_name')

#     try:
#         member = RoomMember.objects.get(
#             uid=uid,
#             room_name=room_name,
#         )
#         name = member.name
#         return JsonResponse({'name': member.name}, safe=False)
#     except ObjectDoesNotExist:
#         return JsonResponse({'error': 'Member does not exist'}, safe=False, status=404)


logger = logging.getLogger(__name__)

def getMember(request):
    uid = request.GET.get('UID') or request.GET.get('uid')
    room_name = request.GET.get('room_name')

    logger.debug(f"UID: {uid}, Room Name: {room_name}")

    if not uid or not room_name:
        logger.error("Missing parameters")
        return JsonResponse({'error': 'Missing parameters'}, safe=False, status=400)

    try:
        member = RoomMember.objects.get(
            uid=uid,
            room_name=room_name,
        )
        return JsonResponse({'name': member.name}, safe=False)
    except RoomMember.DoesNotExist:
        logger.error(f"Member with UID: {uid} and Room Name: {room_name} does not exist.")
        return JsonResponse({'error': 'Member does not exist'}, safe=False, status=404)


@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)

    try:
        member = RoomMember.objects.get(
            name=data['name'],
            uid=data['UID'],
            room_name=data['room_name'],
        )
        member.delete()
        return JsonResponse('Member was deleted', safe=False)
    except ObjectDoesNotExist:
        return JsonResponse('Member does not exist', safe=False, status=404)



















# comments vale

# def getToken(request):
#     # Authentication credentials
#     appId = 'bb70fcdb59ee4abca8258d9dc2fc265c'
#     appCertificate = 'cd9e82ca165a46cc9ffb240ab3c419b0'
    
#     # Get channel name from request
#     channelName = request.GET.get('channel')
    
#     # Generate a random UID between 1 and 230
#     uid = random.randint(1, 230)
    
#     # Token expiration time set to 24 hours
#     expirationTimeInSeconds = 3600 * 24
#     currentTimeStamp = time.time()
#     privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    
#     # Role assigned to the user
#     role = 1
    
#     # Generate the token
#     token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    
#     # Return the token and uid in a JSON response
#     return JsonResponse({'token': token, 'uid': uid}, safe=False)

# def lobby(request):
#     # Render the lobby HTML template
#     return render(request, 'base/lobby.html')

# def room(request):
#     # Render the room HTML template
#     return render(request, 'base/room.html')

# @csrf_exempt
# def createMember(request):
#     # Parse data from the request body
#     data = json.loads(request.body)
    
#     # Get or create a room member with the provided data
#     member, created = RoomMember.objects.get_or_create(
#         name=data['name'],
#         uid=data['UID'],
#         room_name=data['room_name'],
#     )
    
#     # Return the member's name in a JSON response
#     return JsonResponse({'name': data['name']}, safe=False)

# # Define logger
# logger = logging.getLogger(__name__)

# def getMember(request):
#     # Get UID and room name from the GET request
#     uid = request.GET.get('UID') or request.GET.get('uid')
#     room_name = request.GET.get('room_name')
    
#     # Log the received UID and room name
#     logger.debug(f"UID: {uid}, Room Name: {room_name}")
    
#     # Check for missing parameters
#     if not uid or not room_name:
#         logger.error("Missing parameters")
#         return JsonResponse({'error': 'Missing parameters'}, safe=False, status=400)
    
#     try:
#         # Search for the room member with the provided UID and room name
#         member = RoomMember.objects.get(uid=uid, room_name=room_name)
        
#         # Return the member's name in a JSON response
#         return JsonResponse({'name': member.name}, safe=False)
#     except RoomMember.DoesNotExist:
#         # Log error if member does not exist
#         logger.error(f"Member with UID: {uid} and Room Name: {room_name} does not exist.")
#         return JsonResponse({'error': 'Member does not exist'}, safe=False, status=404)

# @csrf_exempt
# def deleteMember(request):
#     # Parse data from the request body
#     data = json.loads(request.body)
    
#     try:
#         # Search for the room member with the provided data
#         member = RoomMember.objects.get(name=data['name'], uid=data['UID'], room_name=data['room_name'])
        
#         # Delete the member
#         member.delete()
        
#         # Return confirmation of deletion
#         return JsonResponse('Member was deleted', safe=False)
#     except ObjectDoesNotExist:
#         # Return error if member does not exist
#         return JsonResponse('Member does not exist', safe=False, status=404)
