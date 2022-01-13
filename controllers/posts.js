import Post from "../models/postSchema.js";
import User from "../models/user.js";
import Comment from "../models/commentModel.js";
// import Cloud
import { storage } from "../cloudinary/posts.js"

export const deletePost = async (req, res) => {
    const { postID = undefined } = req.params
    const post = await Post.findById(postID);
    for (let comment of post.comments) {
        const r1 = await Comment.findByIdAndDelete(comment);
        console.log(r1)
    }
    let user = await User.findById(post.User);
    user.posts = user.posts.filter((id) => {
        return String(id) !== String(postID);
    })
    const r2 = await user.save();
    console.log(r2)
    const r = await Post.findByIdAndDelete(postID);
    console.log(r);
    res.json({ status: true });
}

export const getPosts = async (req, res) => {
    const { id } = req.query
    const user = await User.findById(id);
    const tempPosts = []
    for (let post of user.posts) {
        let tPost = await Post.findById(post).populate('User');
        const comments = []
        for (let commentId of tPost.comments) {
            const tComment = await Comment.findById(commentId).populate('author')
            if (tComment != null)
                comments.push(tComment)
        }
        tPost.comments = comments
        tempPosts.push(tPost)
    }
    res.json({ status: true, posts: tempPosts })
}

export const createPostHandler = async (req, res) => {
    console.log(req.files)
    const date = new Date;
    const dateN = `${date.getDate()}|${date.getMonth()}|${date.getFullYear()}`
    const time = `${date.getHours()}:${date.getMinutes()}`
    const tempPost = new Post(req.body)
    console.log(req.files)
    // const result = await storage.cloudinary.uploader.upload(req.files);
    for (let file of req.files) {
        const result = await storage.cloudinary.uploader.upload(file.path);
        console.log(result)
    }
    tempPost.images = req.files.map(f => f.path);
    tempPost.User = req.user._id
    tempPost.time = time
    tempPost.date = dateN
    const res1 = await tempPost.save();
    console.log(res1)
    const user = await User.findById(req.user._id);
    user.posts.push(res1);
    await user.save();
    res.redirect('/')
}

export const likePost = async (req, res) => {
    const post = await Post.findById(req.params.postID)
    post.likes.push({ author: req.user._id });
    const savedPost = await post.save();
    console.log(savedPost.likes.length)
    res.json({ status: true, noOfLikes: savedPost.likes.length })
}

export const dislikePost = async (req, res) => {
    let post = await Post.findById(req.params.postID)
    post.likes = post.likes.filter((like) => {
        return String(like.author._id) !== String(req.user._id)
    })
    const savedPost = await post.save();
    res.json({ status: true, noOfLikes: savedPost.likes.length })
}