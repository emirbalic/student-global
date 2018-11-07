const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Post model
const Model = require('../../models/Post');

//Load Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

// @route GET api/posts/test
// @desc Tests post route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Posts works!' }));

// @route GET api/posts/
// @desc Get posts
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfound: 'No Posts Found!' }));
});

// @route GET api/posts/:id
// @desc Get posts by id
// @access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: 'No Post Found With That ID!' })
    );
});

// @route POST api/posts/
// @desc Create post
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      //If any errors, send 400 with error object
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar, // avatar???
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route DELETE api/post/:ID
// @desc Delete post by id
// @access Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for post owner
          if (post.user.toString() !== req.user.id) {
            // 401 is an authorization status
            return res
              .status(401)
              .json({ notauthorized: 'You are not authorized to do that!' });
          }
          // Delete
          post.remove().then(() => res.json({ succes: true }));
        })
        .catch(err =>
          res.status(404).json({ postnotfount: 'Post not found!' })
        );
    });
  }
);

// @route DELETE api/post/:ID
// @desc Delete post by id
// @access Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for post owner
          if (post.user.toString() !== req.user.id) {
            // 401 is an authorization status
            return res
              .status(401)
              .json({ notauthorized: 'You are not authorized to do that!' });
          }
          // Delete
          post.remove().then(() => res.json({ succes: true }));
        })
        .catch(err =>
          res.status(404).json({ postnotfount: 'Post not found!' })
        );
    });
  }
);
// @route POST api/posts/like/:ID
// @desc Like post (by id)
// @access Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // what it means is that the user's id is already in post.likes array --y greater then zero? ok ic //already there
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this post!' });
          }
          // Add the user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfount: 'Post not found!' })
        );
    });
  }
);

// @route POST api/posts/unlike/:ID
// @desc Unlike post (by id)
// @access Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // what it means is that the user's id is already in post.likes array --y equal zero? because he is not there -> the result is greater than zero
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notalreadyliked: 'You have not liked this post!' });
          }
          // Get the remove index from the  likes array
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id); //the user that I want to remove

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfount: 'Post not found!' })
        );
    });
  }
);
// @route POST api/posts/comment/:ID
// @desc Add comment to post (by id)
// @access Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //using the /post validation
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      //If any errors, send 400 with error object
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        //Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(404).json({ postnotfound: 'The post does not exist' })
      );
  }
);

// @route DELETE api/posts/comment/:id/post/:id
// @desc Remove comment from post (by ids of both comment and post)
// @access Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //find post by id and...
    Post.findById(req.params.id)
      //get the post
      .then(post => {
        // Check to see if comment exists <use filter()>
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          //if this is true the comment does not exist <if it equals zero>
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index, just like before, but thing AGAIN
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(404).json({ postnotfound: 'The post does not exist' })
      );
  }
);

module.exports = router;
