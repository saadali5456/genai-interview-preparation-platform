const mongoose = require('mongoose');
//**
// job decription
// resume text
// self description
// matchScore: Number 


// technical questions:[{
 //question: "",  
//  intention: "",
// answer : "",
//}]
// behavioral questions
// skill gaps: skill: ""
//             severity: ""
//             type : String,
//              enum : ["hard skill", "soft skill", "knowledge gap"],    
// preparation plan
// day : number
// focus : String
// tasks : [string] */
const technicalQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "Question is required"],
        },

        intention: {
            type: String,
            required: [true, "Intention is required"],
        },

        answer: {
            type: String,
            required: [true, "Answer is required"],
        },
    },
    {
        _id: false,
    }
);
const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Behavioral question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},{
    _id: false,
});

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"]
    },
    severity: {
        type: String,   
        enum: ["hard skill", "soft skill", "knowledge gap"],
        required: [true, "Severity is required"]
    }
},{
    _id: false,
})
const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]
},{
});  

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is required"],
    },

    resume: {
        type: String,
    },

    selfDescription: {
        type: String,
    },

    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },

    behavioralQuestions: [behavioralQuestionSchema],
    technicalQuestions: [technicalQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlans: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    title: {
        type: String,
        required: [true, "Title is required"],

    }
},{
 timestamps: true
});

const InterviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);
module.exports = InterviewReportModel;
