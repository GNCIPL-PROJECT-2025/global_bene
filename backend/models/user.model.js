import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator"
import crypto from "crypto"

const userSchema = new Schema({
    username: {
        type: String,
        // required: true,
        trim: true,
        minlength: [4, "Username must be at least 4 characters long"],
        maxlength: [100, "Username cannot be more than 100 characters"]
    },
    phone: {
        type: Number,
        required: function() {
            return !this.googleId; // Phone required only if not Google auth
        },
        unique: true,
        sparse: true, // Allows multiple null values
        trim: true,
        validate: {
            validator: function (value) {
                if (!value) return true; // Allow null for Google users
                const str = value.toString();
                return /^[1-9]\d{9}$/.test(str) && Number.isInteger(value);
            },
            message: "Please enter a valid 10-digit Indian mobile number"
        }

    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value); //  true or false
            },
            message: "Please enter email in correct format - /xyz@gmail.com/"
        }
    },
    googleId: {
        type: String,
        sparse: true, // Allows multiple null values but unique for non-null
        unique: true
    },
    gender: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "not specified"
    },
    bio: {
        type: String,
        default: "",
        maxlength: [500, "Bio cannot be more than 500 characters"],
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password required only if not Google auth
        },
        minlength: [8, "Password must be at least 8 chatacter long"],
        // select: false
    },
    role: {
        type: String,
        default: "user"
    },
    avatar: {
        public_id: {
            type: String,
            // required: true
        },
        secure_url: {
            type: String,
            // required: true
        }
    },

    refreshToken: {
        type: String,
        // select: false
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    social_links: {
        youtube: {
            type: String,
            default: "",
        },
        instagram: {
            type: String,
            default: "",
        },
        linkedin: {
            type: String,
            default: "",
        },
        twitter: {
            type: String,
            default: "",
        },
        github: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default: "",
        }
    },



    verificationCode: Number,
    verificationCodeExpire: Date,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,

    savedPosts: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],

    joined_at: {
        type: Date,
        default: Date.now
    },

    num_posts: {
        type: Number,
        default: 0
    },

    num_comments: {
        type: Number,
        default: 0
    },

    communities_followed: [{
        type: Schema.Types.ObjectId,
        ref: "Community"
    }],

    num_communities: {
        type: Number,
        default: 0
    },

},
    {
        timestamps: true,
    }

);


// * is password modified
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// *password validation
userSchema.methods.isPasswordCorrect = async function (password) {
    // console.log(password, this.password)
    return await bcrypt.compare(password, this.password)
}



// * access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            phone: this.phone || null,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// * refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

// * generate verificatoin code
userSchema.methods.generateVerificationCode = function () {
    function generateCodeNumber() {
        const firstDigit = Math.floor(Math.random() * 9) + 1
        const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(5, 0)

        return parseInt(firstDigit + remainingDigits)
    }

    const verificationCode = generateCodeNumber()
    this.verificationCode = verificationCode
    this.verificationCodeExpire = Date.now() + 3 * 60 * 1000
    // console.log("Generated Verification Code:", verificationCode);
    return verificationCode
}

// *Reset password link
userSchema.methods.generateResetPasswordLink = function () {
    const forgotToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")

    this.forgotPasswordTokenExpiry = Date.now() + 7 * 60 * 1000

    return forgotToken
}

export const User = mongoose.model("User", userSchema);