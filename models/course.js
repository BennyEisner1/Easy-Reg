const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: String,
  description: String,
  professor: String,
  credits: Number,
  location: String,
  student_rating: Number,
  course_level: Number,
  department: { type: String },
  times: [
    {
      start_time: String,
      end_time: String,
      day: String,
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});
CourseSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Course", CourseSchema);
