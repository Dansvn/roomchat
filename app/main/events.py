from flask import session, request
from flask_socketio import emit, join_room, leave_room
from .. import socketio
from .routes import active_users  

sid_to_user = {}

@socketio.on('joined', namespace='/chat')
def joined(message):
    room = session.get('room')
    name = session.get('name')

    sid_to_user[request.sid] = (room, name)
    if room not in active_users:
        active_users[room] = set()
    active_users[room].add(name)

    join_room(room)
    emit('status', {'msg': f"{name} has entered the room."}, to=room)

@socketio.on('message', namespace='/chat')
def handle_message(data):
    room = session.get('room')
    name = session.get('name')

    msg_type = data.get('type', 'text')
    msg = data.get('msg')
    image = data.get('image', None)

    print(f"[{msg_type.upper()}] from {name}: {str(msg)[:50]}...")

    emit('message', {
        'type': msg_type,
        'from': name,
        'msg': msg,
        'image': image
    }, to=room)

@socketio.on('left', namespace='/chat')
def left(message):
    room = session.get('room')
    name = session.get('name')
    leave_room(room)

    sid_to_user.pop(request.sid, None)
    if room in active_users and name in active_users[room]:
        active_users[room].remove(name)
        if not active_users[room]:
            active_users.pop(room)

    emit('status', {'msg': f"{name} has left the room."}, to=room)

@socketio.on('disconnect', namespace='/chat')
def disconnect():
    user = sid_to_user.pop(request.sid, None)
    if user:
        room, name = user
        leave_room(room)
        if room in active_users and name in active_users[room]:
            active_users[room].remove(name)
            if not active_users[room]:
                active_users.pop(room)
        emit('status', {'msg': f"{name} has left the room."}, to=room)

