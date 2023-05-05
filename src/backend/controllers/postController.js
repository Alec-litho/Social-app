let {PostModel} = require('../models/post')

let getAll = async(req,res) => {
    try {
        let posts = await PostModel.find().populate('user').exec()

        res.json(posts)
    } catch (error) { 
        console.log(error);
        res.status(500).json({message:'Could not get posts'})
    }
}
let getMyPosts = async function(req, res) {
    let posts = await PostModel.find({user: req.body.id})
    res.send(posts)
}
let getOne = async(req,res) => {
    try {
        const postId = req.params['id']
        PostModel.findOneAndUpdate(
        {_id: postId},
        {$inc: {viewsCount: 1}},
        {returnDocument: 'after'},
        ).then(doc => {
                res.json(doc)
            }
        ).catch(err => console.log(err))
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Could not get posts'})
    }
}
let deletePost = async(req,res) => {
    try {
        const postId = req.params['id']
        PostModel.findOneAndDelete({_id: postId})
          .then(doc => {
            res.json({message: "post was deleted"})
          })
    } catch (error) {
        
    }
}
let update = async(req,res) => {
    try {
        const postId = req.params['id']
        await PostModel.updateOne({_id: postId},
            {   
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                tags: req.body.tags,
                user: req.userId
            }
        )
    } catch (error) {
        
    }
}

let create = async(req,res) => {
    try {
        const doc = new PostModel({
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.body.id
        })
        const post = await doc.save()
        res.json(post)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Could not upload post'})
    }
}

module.exports = {
    create,
    getAll,
    getOne,
    deletePost,
    update,
    getMyPosts
}