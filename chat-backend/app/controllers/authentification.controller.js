const db = require("../models");
const User = db.users;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TOKEN_SECRET = "secretKey";
// Login user
exports.login = async (req, res) => {

    User.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            console.log(err)
        } else {
            if (user) {
                const validPass = await bcrypt.compare(req.body.password, user.password);
                if (!validPass) return res.status(401).send("Email or Password is wrong");
                // Create and assign token
                let payload = { id: user._id, password: user.password };
                const token = jwt.sign(payload, TOKEN_SECRET);
                const response = {
                    user: user,
                    accessToken: token
                };
                res.status(200).header("auth-token", token).send({ "data": response });
            }
            else {
                //res.status(401).send('Invalid mobile')
            }

        }
    })
};

// Register.
exports.register = async (req, res) => {
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hasPassword = await bcrypt.hash(req.body.password, salt);

    // Create an user object
    let user = new User({
        email: req.body.email,
        name: req.body.name,
        password: hasPassword,
        groups: []
    });

    User.findOne({ email: req.body.email }, async (err, current_user) => {
        if (err) {
            console.log(err)
        } else {
            if (current_user) {
                return res.status(401).send({ "response": 'Address email is taken' });
            }
            else {
                // Save User in the database
                user.save((err, registeredUser) => {
                    if (err) {
                        console.log(err)
                    } else {
                        let payload = { id: registeredUser._id, user_type_id: req.body.user_type_id || 0 };
                        const token = jwt.sign(payload, TOKEN_SECRET);

                        const response = {
                            user: user,
                            accessToken: token
                        };
                        // create payload then Generate an access token
                        res.status(200).send({ 'data': response })
                    }
                })
            }

        }
    })


};
