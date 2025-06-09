from flask import session, redirect, url_for, render_template, request
from . import main
from .forms import LoginForm

active_users = {}

@main.route('/', methods=['GET', 'POST'])
def index():
    form = LoginForm()
    if form.validate_on_submit():
        name = form.name.data.strip()
        room = form.room.data.strip()

        if room in active_users and name in active_users[room]:
            form.name.errors.append("This username is already in use in this room.")
            return render_template('index.html', form=form)

        session['name'] = name
        session['room'] = room
        return redirect(url_for('.chat'))
    elif request.method == 'GET':
        form.name.data = session.get('name', '')
        form.room.data = session.get('room', '')
    return render_template('index.html', form=form)


@main.route('/chat')
def chat():
    name = session.get('name', '')
    room = session.get('room', '')
    if name == '' or room == '':
        return redirect(url_for('.index'))
    return render_template('chat.html', name=name, room=room)


@main.route('/terms')
def terms():
    return render_template('terms.html', name='')

