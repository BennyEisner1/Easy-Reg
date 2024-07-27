const Joi = require('joi');

module.exports.courseSchema = Joi.object({
    course: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        student_rating: Joi.number().required().min(1).max(5),
        description: Joi.string().required()
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})

