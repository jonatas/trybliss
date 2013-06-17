Meteor.autorun ->
  if user_id = Meteor.userId()
    if user_id != Meteor.userId()
      Session.set "user_id", Meteor.userId()
      if user=Meteor.users.findOne Meteor.userId()
        Session.set "user_name",user.profile.name
      if level = Session.get("currentLevel")
        if not level.author
          Levels.update level._id, $set: {author: Meteor.userId()}

  if not Session.get('currentLanguage')
    Session.set('currentLanguage','br')

  if not Session.get("currentLevel")
    level = Levels.findOne(title: "Bem vindo!", language: Session.get("currentLanguage"))
    Session.set("currentLevel", level)
