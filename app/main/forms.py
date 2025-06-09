from flask_wtf import FlaskForm
from wtforms.fields import StringField, SubmitField
from wtforms.validators import DataRequired

class LoginForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    room = StringField('Room', validators=[DataRequired()])
    submit = SubmitField('Enter Chatroom')

