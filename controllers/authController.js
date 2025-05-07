const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const sendEmail = require('../utils/sendEmail');
const { generateToken, generateRefreshToken } = require('../utils/token');
const { secretKey } = require('../config/jwt');
const logger = require("../utils/logger");
const { generateOTP } = require('../utils/otp');
const { registerTemplate } = require('../utils/emailTemplates');

require("dotenv").config();

const registerUser = async (req, res) => {
    try {
      const { full_name, phone, email, password } = req.body;
  
      if (!full_name || !email || !password) {
        return res.status(400).json({
          statusCode: 400,
          message: "Full name, email, and password are required.",
          data: [],
        });
      }
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          statusCode: 400,
          message: "Email is already registered.",
          data: [],
        });
      }
      // Create user 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const savedUser = await prisma.user.create({
        data: {
          full_name,
          phone,
          email,
          password: hashedPassword,
          profilePicture: "",
        }
      });

      //OTP Generation
      const OTP_Code = generateOTP();
      const expirationTime = new Date(); // Current time
      expirationTime.setMinutes(expirationTime.getMinutes() + 5); // Add 5 minutes to the current time

      const existingOTP = await prisma.otp.findFirst({
        where: { email }
      });
      
      if (existingOTP) {
        await prisma.otp.update({
          where: { id: existingOTP.id },
          data: { otp: OTP_Code, otpExpiresAt: expirationTime }
        });
      } else {
        await prisma.otp.create({
          data: { 
            email,
            otp: OTP_Code,
            otpExpiresAt: expirationTime
          }
        });
      }

      // Send welcome email with OTP
      try {
        const { text, html } = registerTemplate(full_name, OTP_Code);
        await sendEmail(email, 'Welcome to Our Platform!', text, html);
      } catch (emailError) {
        logger.error("Failed to send welcome email: " + emailError.message);
      }
      const userObj = {
        id: savedUser.id,
        full_name: savedUser.full_name,
        phone: savedUser.phone,
        email: savedUser.email,
      };
  
      res.status(201).json({
        statusCode: 201,
        message: "User registered successfully.",
        data: userObj,
      });
  
    } catch (err) {
      res.status(400).json({
        statusCode: 400,
        message: err.message,
        data: [],
      });
    }
};
  
const loginUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
          where: { email: req.body.email }
        });
        
        if (!user) return res.status(404).json({ 
            statusCode: 404,
            message: 'User not found',
            data: []
        });
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).json({ 
            statusCode: 401,
            message: 'Invalid password',
            data: []
        });
        
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user.id);
        
      // Update refreshToken and log result
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
        select: { id: true, refreshToken: true }, // Return updated fields
      });

      res.json({
        statusCode: 200,
        message: "User logged in successfully",
        data: {
          _id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          emailVerified: user.emailVerified,
          profilePicture: user.profilePicture,
          token,
          refreshToken,
        },
      });
        
       } catch (err) {
        res.status(400).json({ 
            statusCode: 400,
            message: err.message,
            data: []
        });
    }
};
  
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                statusCode: 400,
                message: "Refresh token is required.",
                data: []
            });
        }
        const user = await prisma.user.findFirst({
          where: { refreshToken }
        });
        
        if (!user) {
            return res.status(403).json({
                statusCode: 403,
                message: "Invalid refresh token.",
                data: []
            });
        }
        jwt.verify(refreshToken, secretKey, (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(403).json({
                    statusCode: 403,
                    message: "Invalid or expired refresh token.",
                    data: []
                });
            }
       
            const newAccessToken = generateToken(user);

            res.status(200).json({
                statusCode: 200,
                message: "Token refreshed successfully.",
                data: {
                    accessToken: newAccessToken
                }
            });
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: err.message,
            data: []
        });
    }
};
  
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                statusCode: 400,
                message: "Current, new, and confirm passwords are required.",
                data: []
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                statusCode: 400,
                message: "New password and confirm password do not match.",
                data: []
            });
        }

        const userId = req.user.userId; 
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found.",
                data: []
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                statusCode: 401,
                message: "Current password is incorrect.",
                data: []
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword }
        });
        
        res.status(200).json({
            statusCode: 200,
            message: "Password changed successfully.",
            data: []
        });
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({
            statusCode: 500,
            message: "Internal server error.",
            data: []
        });
    }
};
  
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
          where: { email }
        });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        // OTP Generation
        const OTP_Code = generateOTP();
        const expirationTime = new Date(); // Current time
        expirationTime.setMinutes(expirationTime.getMinutes() + 5); // Add 5 minutes to the current time

        const existingOTP = await prisma.otp.findFirst({
          where: { email }
        });
        
        if (existingOTP) {
            await prisma.otp.update({
              where: { id: existingOTP.id },
              data: { otp: OTP_Code, otpExpiresAt: expirationTime }
            });
        } else {
            await prisma.otp.create({
              data: {
                email,
                otp: OTP_Code,
                otpExpiresAt: expirationTime
              }
            });
        }
     
        await sendEmail(user.email, 'Password Reset', `Your OTP Code is : ${OTP_Code}`);

        res.status(200).json({ 
            statusCode: 200,
            message: 'OTP Code has been sent to your email.',
        });
    } catch (error) {
        res.status(500).json({ 
            statusCode: 500,
            message: error.message,
            data: []
        });
    }
}

const verifyEmailOTP= async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the OTP record
        const existingOTP = await prisma.otp.findFirst({
          where: { email, otp }
        });

        if (!existingOTP) {
            return res.status(404).json({ message: "OTP not found or invalid." });
        }

        // Check if the OTP has expired
        if (existingOTP.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        // Delete the OTP after verification
        await prisma.otp.delete({
          where: { id: existingOTP.id }
        });

        // Update the user's emailVerified field to true
        const user = await prisma.user.update({
          where: { email },
          data: { emailVerified: true }
        });

        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found.",
                data: [],
            });
        }
        
        res.status(200).json({
            statusCode: 200,
            message: "OTP verified and email confirmed.",
            data: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred." });
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the OTP record
        const existingOTP = await prisma.otp.findFirst({
          where: { email, otp }
        });

        if (!existingOTP) {
            return res.status(404).json({ message: "OTP not found or invalid." });
        }

        // Check if the OTP has expired
        if (existingOTP.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        // Delete the OTP after verification
        await prisma.otp.delete({
          where: { id: existingOTP.id }
        });

        res.status(200).json({ message: "OTP verified" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred." });
    }
}

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                statusCode: 400,
                message: "Email is required.",
                data: [],
            });
        }

        const user = await prisma.user.findUnique({
          where: { email }
        });
        
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found.",
                data: [],
            });
        }

        // Generate new OTP
        const OTP_Code = generateOTP();
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 5);

        // Update or create OTP record
        const existingOTP = await prisma.otp.findFirst({
          where: { email }
        });
        
        if (existingOTP) {
            await prisma.otp.update({
              where: { id: existingOTP.id },
              data: { otp: OTP_Code, otpExpiresAt: expirationTime }
            });
        } else {
            await prisma.otp.create({
              data: {
                email,
                otp: OTP_Code,
                otpExpiresAt: expirationTime
              }
            });
        }

        // Send email with new OTP
        try {
            const { text, html } = registerTemplate(user.full_name, OTP_Code);
            await sendEmail(email, 'Your New OTP for Email Verification', text, html);
        } catch (emailError) {
            logger.error("Failed to send OTP email: " + emailError.message);
            return res.status(500).json({
                statusCode: 500,
                message: "Failed to send OTP email, but OTP has been generated.",
                data: [],
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: "New OTP sent successfully.",
            data: [],
        });

    } catch (err) {
        logger.error("Error resending OTP: " + err.message);
        res.status(500).json({
            statusCode: 500,
            message: "An error occurred.",
            data: [],
        });
    }
};
  
const resetPassword = async (req, res) => {
    try {
        const { refreshToken } = req.query;
        const { newPassword } = req.body;

        const decoded = jwt.verify(refreshToken, secretKey);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
        
        if (!user) return res.status(404).json({ message: 'Invalid or expired refresh token' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });

        res.status(200).json({
            statusCode: 200,
            message: 'Password reset successfully.',
            data: user
        });
    } catch (error) {
        res.status(400).json({ 
            statusCode: 500,
            message: 'Invalid or expired token.', 
            data: []
        });
    }
}
  
const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                statusCode: 400,
                message: "Refresh token is required.",
                data: [],
            });
        }

        const user = await prisma.user.findFirst({
          where: { refreshToken }
        });
        
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found.",
                data: [],
            });
        }

        // Remove the refresh token from the user document
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: "" }
        });

        res.status(200).json({
            statusCode: 200,
            message: "User logged out successfully.",
            data: [],
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal server error.",
            data: [],
        });
    }
};
  
const deleteUserAccount = async (req, res) => { 
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({
                statusCode: 400,
                message: "User ID is required.",
                data: []
            });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found.",
                data: []
            });
        }

        await prisma.user.delete({
          where: { id: userId }
        });

        res.status(200).json({
            statusCode: 200,
            message: "User account deleted successfully.",
            data: []
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal server error.",
            data: []
        });
    }
};
  
module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    logoutUser,
    deleteUserAccount,
    verifyEmailOTP,
    verifyOTP,
    resendOTP
};