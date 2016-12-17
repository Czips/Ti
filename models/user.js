var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	name: {
		type: String
	},
	images: {
		type: [String]
	}
});
var conn = mongoose.connection;
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUsers = function(callback){
	conn.db.collection('users', function(err, collection) {
     collection.find({name:'user'}).toArray(function(err, items) {
                 callback(null,items);
             });
         });
}

module.exports.getGroups = function(callback){
	conn.db.collection('groups', function(err, collection) {
     collection.find().toArray(function(err, items) {
                 callback(null,items);
             });
         });
}

module.exports.scheduleUser = function(user,start,stop,image){
	conn.db.collection('schedule', function(err, collection) {
     collection.update(	{username: user, image: image }, 
	{$set: { username: user,
			image: image, 
			start: start, 
			stop: stop
		}
	},
	{ upsert: true }
	);
});
}

module.exports.GetscheduleUsers = function(callback){
	conn.db.collection('schedule', function(err, collection) {
     collection.find().toArray(function(err, items) {
                 callback(null,items);
             });
         });
}


module.exports.UpdateFiles = function(user,files)
{
	conn.db.collection('users', function(err, collection) {
     collection.update(	{username: user }, 
	{$set:{images: files}}
    );
 });
}

module.exports.UpdateGroup = function(user,files)
{
	//update group images
	conn.db.collection('groups', function(err, collection) {
     collection.update(	{gname: user }, 
	{$set:{gimages: files}}
    );
 });

	User.getGroups(function(err,groups){

		for(var key in groups)
		{
			if(groups[key].gname == user)
			{
				for(abc in groups[key].gmembers)
				{
					User.UpdateFiles(groups[key].gmembers[abc], files);
				}
			}
		}
	})
}

module.exports.AddToGroup = function(user,group)
{
	conn.db.collection('groups', function(err, collection) {
    	collection.update(	{gname: group }, 
			{$addToSet:{gmembers: user}}
    );
    });
}

module.exports.CreateGroup = function(groupname)
{
	conn.db.collection('groups', function(err, collection) {
     collection.insert(	{gname: groupname });
 });
}


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}