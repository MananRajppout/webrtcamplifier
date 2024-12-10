const Permission = require("../models/permissionModel");

const getPermissions = async (req, res) => {
    try {
        // await InsertPermissions()
        const result = await Permission.find({}).select("name status");
        return res.status(200).json({ result, message: "Data fetched successfully." });
    } catch (error) {
        return res.status(500).json({ result, message: error.message });
    }
}

const InsertPermissions = async () => {
    try {
        const permissions = [
            { name: "Can create internal admin" },
            { name: "Can see Internal Admin list" },
            { name: "Can manage Moderator list" },
            { name: "Can manage External Admins list" },
            { name: "Can add multiple admin as additional admin" },
            { name: "Can see project list" },
            { name: "Can create projects" },
            { name: "Can edit projects" },
            { name: "Can manage sessions" },
            { name: "Can pause/un-pause projects" },
            { name: "Can close projects" },
            { name: "Can reopen projects" },
            { name: "Can delete projects" },
            { name: "Can see project details" },
            { name: "Access Document Hub" },
            { name: "Access Media Hub" },
            { name: "Can join Zoom meeting" },
            { name: "Can start Zoom meeting" },
            { name: "Can start streaming/recording" }
        ];
         await Permission.insertMany(permissions);
    } catch (error) {
        console.log(error);
    }
}


module.exports = { getPermissions }