import fs from "fs";
import path from "path";
import User from "../models/user.model.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProfile = async (req, res) => {

    try {
        const { name, avatar, companyName, companyDescription, companyLogo, resume } = req.body;
        const user = await User.findById(req.user._id);  // since it is protected route, we have access to "user" in the request (through the middleware)
    
        if(!user) {
            return res.status(404).json({ message: "User not found"});
        }

        user.name = name || user.name;
        user.avatar = avatar || user.avatar;
        user.resume = resume || user.resume;

        if(user.role === "employer") {
            user.companyName = companyName || user.companyName;
            user.companyDescription = companyDescription || user.companyDescription;
            user.companyLogo = companyLogo || user.companyLogo;
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            companyName: user.companyName,
            companyDescription: user.companyDescription,
            companyLogo: user.companyLogo,
            resume: user.resume || "",
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

export const deleteResume = async (req, res) => {
    try {
        const { resumeUrl } = req.body;

        const fileName = resumeUrl?.split('/')?.pop();

        const user = await User.findById(req.user._id);

        if(!user) return res.status(404).json({ message: "User not found"});

        if(user.role !== "jobseeker") return res.status(403).json({ message: "Only jobseekers can delete resume"})

        // construct full file path
        const filePath = path.join(__dirname, '../uploads', fileName);

        // check if the file exists and then delete
        if(fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // set the users resume to an empty string
        user.resume = '';
        await user.save();

        res.json({ message: "Resume deleted successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if(!user) {
            return res.status(404).json({ message: "User not found"});
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};