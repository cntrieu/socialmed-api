const User = require('../models/User');
const Thought = require('../models/Thought');

module.exports = {

    async getUsers(req, res) {
        try {
            const users = await User.find();

            res.json(users);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    async getSingleUser(req, res) {
        try {
            const user = await User.findOne({ _id: req.params.userId })
            .populate('thoughts')
            .populate('friends');

            if (!user) {
                return res.status(404).json({ message: 'No such user with ID' })
            }

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },

    async createUser(req, res) {
        try {
            const dbUserData = await User.create(req.body);
            res.json(dbUserData);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    async updateUser(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $set: req.body },
                //telling mongoose to run validators on the update operation and return the updated document instead of the original
                { runValidators: true, new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'No such user with ID' })
            }
            res.json(user);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
          }
    },

    async deleteUser(req, res) {
        try {
            const user = await User.findOneAndDelete({ _id: req.params.userId });

            if (!user) {
                return res.status(404).json({ message: 'No such user with that ID' })
            }

            await Thought.deleteMany({ _id: { $in: user.thoughts }});
            res.json({ message: "User and user thoughts deleted" })
        } catch (err) {
            res.status(500).json(err);
        }
    },

    async addFriend(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                // push the friendId to friends in User model
                { $push: { friends: req.params.friendId } },
                { runValidators: true, new: true }
            )

            if (!user) {
                return res.status(404).json({ message: 'No such user with that ID' })
            }

            res.json("This user has been added to your friend's list");
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
          }
    },


    async deleteFriend(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $pull: { friends: req.params.friendId }},
                { runValidators: true, new: true }
            )

            if (!user) {
                return res.status(404).json({ message: 'No such user with that ID' })
            }

            res.json("User has been removed from friends list.");
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
          }
    }
}