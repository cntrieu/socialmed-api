const User = require('../models/User');
const Thought = require('../models/Thought');

module.exports = {
    async getThoughts (req, res) {
        try {
            const thoughts = await Thought.find();
            res.json(thoughts)
        } catch (err) {
            res.status(500).json(err);
          }
    },

    async getSingleThought (req, res) {
        try {
            const thought = await Thought.findOne({ _id: req.params.thoughtId})

            if(!thought) {
                return res.status(404).json({ message: 'No thoughts with that ID' });
            }

            res.json(thought)
        } catch (err) {
            res.status(500).json(err);
          }
    },

    
    // Creates a new thought by accepting a request body with Thoughts object.
    // Updating the User who created the thought and adding the ID of the thought to thoughts array of the specific user
    async createThought (req, res) {
        try {
            const thought = await Thought.create(req.body);
            const user = await User.findOneAndUpdate(
                { username: req.body.username },
                { $addToSet: { thoughts: thought._id }},
                { new: true }
            )

            if (!user) {
                return res.status(404).json({ message: "No user with that ID! "})
            }

            res.json('Thought added!')
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
          }
    },


    // Updates a thought by finding the thought. Uses the $set operator to inject new request body and then has a validation
    async updateThought (req, res) {
        try {
            const thoughts = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $set: req.body },
                { runValidators: true, new: true }
                )

            if (!thoughts) {
                return res.status(404).json({ message: "No thoughts found with that ID! "})
            }

            res.json(thoughts);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
          }
    },

    // We delete the thought using findOneAndRemove. We also pull that thoughtid from the thoughts array in User.
    async deleteThought (req, res) {
        try {
            const thought = await Thought.findOneAndRemove(
                { _id: req.params.thoughtId }
            )

            if(!thought) {
                return res.status(404).json({ message: 'No thought found with this id!' });
            }

            const user = await User.findOneAndUpdate(
                { thoughts: req.params.thoughtId },
                { $pull: { thoughts: req.params.thoughtId } },
                { new: true }
              );

            if (!user) {
                return res.status(404).json({
                  message: 'Thought deleted, but no user with this id!',
                });
              }

            res.json({ message: "Thought deleted!" });
        } catch (err) {
            res.status(500).json(err);
          }
    },

    // Adds a reaction onto the thoughts model by using addToSet to add to the reactions array
    async createReaction(req, res) {
        try {
            const thought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $addToSet: { reactions: req.body }},
                { new: true }
            );

            if (!thought) {
                return res.status(404).json({ message: 'No thought with this id!' });
              }

            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
          }
    },

    // We remove a reaction from the Thoughts model by using $pull on the reactions parameter to find the reactionId.
    async removeReaction(req, res) {
        try {
            const thought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $pull: { reactions: { reactionId: req.params.reactionId }}},
                {  new: true }
            );

            if (!thought) {
                return res.status(404).json({ message: 'No thought with this id!'})
            }

            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
          }
    }
}