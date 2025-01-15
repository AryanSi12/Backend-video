import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment", // Reference to the parent comment for replies
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Add pagination plugin for easier query handling
commentSchema.plugin(mongooseAggregatePaginate);

// Create and export the Comment model
export const Comment = mongoose.model("Comment", commentSchema);
