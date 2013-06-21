Meteor.publish "directory", -> Meteor.users.find({}, fields: {emails: 1, profile: 1})
