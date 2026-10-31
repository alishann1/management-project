
import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        reviewPeriod: {
            type: String,
            required: true,
            trim: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        rating: {
            type: String,
            enum: [
                "Excellent",
                "Very Good",
                "Good",
                "Satisfactory",
                "Needs Improvement",
            ],
            required: true,
        },
        strengths: {
            type: String,
            required: true,
            trim: true,
        },
        improvements: {
            type: String,
            required: true,
            trim: true,
        },
        reviewDate: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// Automatically calculate the rating from the performance score.
performanceSchema.pre("validate", function () {
    if (this.score >= 90) {
        this.rating = "Excellent";
    } else if (this.score >= 80) {
        this.rating = "Very Good";
    } else if (this.score >= 70) {
        this.rating = "Good";
    } else if (this.score >= 60) {
        this.rating = "Satisfactory";
    } else {
        this.rating = "Needs Improvement";
    }
});

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
