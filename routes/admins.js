var express = require('express');
var router = express.Router();


var image = require('../models/image');
var User = require('../models/user');
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

router.post('/', upload.single('avatar'),function(req, res){
	image.UploadImage(req , res, function(){
		req.flash('success_msg', 'Sucess');
		res.redirect('/admin');
	});
	//res.render('admin');
});

router.get('/users',ensureAuthenticated, function(req,res){
	User.getUsers(function(err,users){
		image.GetAllImages(function(err,images){
			User.GetscheduleUsers(function(err,schedulesImages){
			var result={};
			for(var key in users) result[users[key].username]=users[key];
			for(var key in schedulesImages)
			{
				for(var kay in result[schedulesImages[key].username].images)
				{
					if (result[schedulesImages[key].username].images[kay] == schedulesImages[key].image)
					{
						result[schedulesImages[key].username].images[kay] = schedulesImages[kay];
					}
				}
			}
				res.render('adminusers',{users:result, aimages:images});
			});
	});
	});
});

router.get('/groups',ensureAuthenticated, function(req,res){
	User.getUsers(function(err,user){
		User.getGroups(function(err,groups){
			image.GetAllImages(function(err,images){
					//console.log(images);
					res.render('groups',{groups:groups,users:user, aimages:images});
	});
	});
	});
});

router.post('/groups', function(req,res){
	User.CreateGroup(req.body.groupname);
	req.flash('success_msg', 'Sucess');
	res.redirect('/admin/groups');
});


router.post('/groups/add', function(req,res){
	console.log(req.body.usertoadd, req.body.grouptoadd);
	User.AddToGroup(req.body.usertoadd, req.body.grouptoadd);
	req.flash('success_msg', 'Sucess');
	res.redirect('/admin/groups');
});

router.get('/images',ensureAuthenticated,function(req, res){
	image.GetAllImages(function(err,images){
			res.render('images', {images:images});
	});
});

module.exports = router;