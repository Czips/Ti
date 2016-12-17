var express = require('express');
var router = express.Router();


var User = require('../models/user');
// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){

	User.getUserByUsername(req.user.username, function(err, user) {
		//console.log(user['images']);
    	res.render('client', {layout: false, username: user['username'], images: user['images'] });
  });
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

var image = require('../models/image');

router.get('/admin',ensureAuthenticated,function(req, res){
	User.getUsers(function(err,users)
	{
		image.GetAllImages(function(err,images){
		res.render('admin',{ users: users, aimages:images});
	});
	});
});

router.get('/public/:filename',ensureAuthenticated,function(req, res){
	image.GetImage(req, res);
});

module.exports = router;