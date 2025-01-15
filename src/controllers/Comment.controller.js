import mongoose from "mongoose"
import {Comment} from "../models/Comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video ID not found");
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                parentComment: null // Fetch only top-level comments
            }
        },
        {
            $lookup: {
                from: "comments", // Same collection for replies
                localField: "_id", // Top-level comment ID
                foreignField: "parentComment", // Replies with parentComment matching top-level ID
                as: "replies",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullName: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] } // Flatten owner array for replies
                        }
                    },
                    {
                        $project: {
                            content: 1,
                            parentComment: 1, // Include parentComment field in replies
                            "owner.username": 1,
                            "owner.avatar": 1,
                            "owner.fullName": 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] } // Flatten owner array
            }
        },
        {
            $project: {
                content: 1,
                "owner.username": 1,
                "owner.avatar": 1,
                "owner.fullName": 1,
                replies: 1, // Include nested replies with their owners and parentComment
                createdAt: 1,
                updatedAt: 1
            }
        },
        {
            $sort: { createdAt: -1 } // Sort by latest comments
        },
        {
            $skip: (page - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);
    
    if (!comments.length) {
        throw new ApiError(404, "No comments found for this video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {content} = req.body

    if(!videoId || !content)throw new ApiError(404,"provide both content and video id ")

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : req.user._id
    })

    if(!comment){
        throw new ApiError(500,"something went wrong when adding your comment in database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,comment,"comment added successfully"))
})   

const addReply = asyncHandler(async (req,res) => {
    const {videoId, parentId} = req.params
    const {content} = req.body

    if(!parentId)throw new ApiError(404, "Can not add a reply without parent comment");

    if (!videoId || !content) {
        throw new ApiError(404, "Provide both content and video ID");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
        parentComment: parentId
    });

    if (!comment) {
        throw new ApiError(500, "Something went wrong when adding your comment to the database");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully"));
})
const updateComment = asyncHandler(async (req, res) => {
    
})

const deleteComment = asyncHandler(async (req, res) => {
    
    const {commentId} = req.params
    if(!commentId)throw new ApiError(404,"Comment id is required")
      
    const comment =await Comment.findById(commentId)
   
    if(!comment)throw new ApiError(404,"Comment does'nt exists")         
     
    if(comment.owner.toString() !== req.user._id.toString())throw new ApiError(508,"You don't have access to delete this comment")

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    
        if(!deletedComment)throw new ApiError(500,"Something went wrong while deleting the video")
            
            await Comment.updateMany(
                { parentComment: commentId }, // Find child comments
                { $set: { parentComment: null } } // Set parentComment to null
            ); 
        return res
        .status(200)  
        .json(new ApiResponse(200,deletedComment,"Playlist deleted sucessfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment,
    addReply
}