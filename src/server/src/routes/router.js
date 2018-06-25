const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Scene = require('../models/scene');
const {OAuth2Client} = require('google-auth-library');
const path = require('path');
const client = new OAuth2Client("610090456564-23f3eajr9hscvup4rpcps994e2l0mf91.apps.googleusercontent.com");

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "610090456564-23f3eajr9hscvup4rpcps994e2l0mf91.apps.googleusercontent.com",
    });

    return ticket.getPayload();
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

//POST route for updating data
router.post('/api/sign_in', function (req, res, next) {

    let id_token = req.body.id_token;
    verify(id_token)
        .then(function (user_data) {
            const userData = {
                userId: user_data.sub,
                email: user_data.email,
                userName: user_data.name,
            };
            User.checkOnExist(userData.userId, function (error, user) {
                if(error){
                    const err = new Error('Error in checkOnExist!');
                    err.status = 401;
                    return next(err);
                }
                if(user){
                    req.session.userId = user._id;
                }else{
                    User.create(userData, function (error, user) {
                        if (error) {
                            next(error);
                        } else {
                            req.session.userId = user._id;
                        }
                    });
                }
                res.send(JSON.stringify({
                    redirected: true,
                    urlToRedirect: 'http://' + req.headers.host + "/profile"
                }));
            });
        })
        .catch(console.error);
});

router.get(['/profile'], function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    res.redirect("/");
                }else{
                    next();
                }
            }
        })
});

router.get('/', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user !== null) {
                    res.redirect("/profile");
                }else{
                    next();
                }
            }
        })
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get(['/scene/:sceneId', '/scene/:sceneId/:modeId'], function (req, res, next) {
    const {modeId, sceneId} = req.params;

    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            }
            if((user === null && !modeId) || (user && user.userScenes.indexOf(sceneId) === -1 && !modeId)){
                res.redirect("/private");
            }
        });

    if(modeId && sceneId){
        Scene.findById(sceneId, function (err, scene) {
            if(!scene.links.find(val => val.linkUrl === modeId)){
                res.redirect("/private");
            }
        })
    }
    res.sendFile(path.resolve(__dirname + '/../../public/scene.html'));
});

router.post('/api/scenes', function (req, res, next) {
    User.findById(req.session.userId)
        .populate('userScenes')
        .exec(function (err, user) {
            res.send(JSON.stringify(user.userScenes));
        })
});


router.post('/api/scenes/create', function (req, res, next) {
    const sceneData = { name: req.body.name };
    Scene.create(sceneData).then(function (scene) {
        User.findOneAndUpdate(
            { _id: req.session.userId },
            { $push: { userScenes: scene._id } }
        ).then(function (user) {
            res.send(JSON.stringify(scene))
        });
    });
});

router.post('/api/scenes/delete', function (req, res, next) {
    const sceneData = { _id: req.body._id };
    Scene.remove(sceneData).then(function (scene) {
        User.findOneAndUpdate(
            {_id: req.session.userId},
            {$pull: {userScenes: sceneData._id}}
        ).then(function () {
            res.send(JSON.stringify(''));
        });
    });
});

router.post('/api/scenes/edit', function (req, res, next) {
    Scene.findOneAndUpdate({_id: req.body._id}, req.body, {new: true}).then(function (scene) {
        res.send(JSON.stringify(scene));
    });
});

router.post('/api/scenes/generate_link', function (req, res, next) {
    Scene.findOneAndUpdate(
        { _id: req.body._id },
        { $push: {
            links: {
                type: req.body.type,
                linkUrl: guid()
            }
        } },
        {new: true}
    ).then(function (scene) {
        res.send(JSON.stringify(scene));
    });
});

router.post('/api/scenes/delete_link', function (req, res, next) {
    Scene.findOneAndUpdate(
        { _id: req.body._id },
        { $pull: { links: { linkUrl: req.body.link_id } } },
        {new: true}
    ).then(function (scene) {
        res.send(JSON.stringify(scene));
    });
});

module.exports = router;