Meteor.publish "directory", (id) -> Meteor.users.findOne(id, fields: {emails: 1, profile: 1})
