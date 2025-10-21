import User from "../models/UserSchema.js"
import Booking from "../models/BookingSchema.js" 
import Doctor from "../models/DoctorSchema.js"

export const updateUser = async (req, res) => {

    const id = req.params.id

    try {
        const updatedUser = await User.findByIdAndUpdate (
            id,
            { $set: req.body },
            { new: true }
        );
        res
            .status(200)
            .json({
                success: true,
                message: "Successfully updated user",
                data: updatedUser,
            });
    } catch (error) {
        res
            .status(500)
            .json({ 
                success: false, 
                message: "Failed to update" 
            });
    }
};

export const deleteUser = async (req, res) => {

    const id = req.params.id;

    try {
        await User.findByIdAndDelete (
            id,
        );

        res
            .status(200)
            .json({
                success: true,
                message: "Successfully deleted user",
            });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete" });
    }
};


export const getSingleUser = async (req, res) => {

    const id = req.params.id;

    try {
        const user = await User.findById (id)
            .select("-password");
        res
            .status(200)
            .json({
                success: true,
                message: "User found",
                data: user,
            });
    } catch (error) {
        res.status(404).json({ success: false, message: "No user found" });
    }
};



export const getAllUser = async (req, res) => {

    try {
        const users = await User.find ({}) .select("-password");
        res
            .status(200)
            .json({
                success: true,
                message: "Users found",
                data: users,
            });
    } catch (error) {
        res.status(404).json({ success: false, message: "Not found" });
    }
};

export const getUserProfile = async (req, res) => {
    const userId = req.user.id; // ✅ Cambio aquí
  
    try {
      const user = await User.findById(userId).select("-password");
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({ 
        success: true,
        message: 'Profile info retrieved',
        data: user
      });
    } catch (error) {
      console.error("❌ Error en getUserProfile:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

export const getMyAppointments = async (req, res) => {
    try {
      const userId = req.user.id; // ✅ Cambio aquí
  
      const booking = await Booking.find({ user: userId });
  
      const doctorIds = booking.map(el => el.doctor);
  
      const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select("-password");
  
      res.status(200).json({
        success: true,
        message: "Appointments retrieved",
        data: doctors,
      });
    } catch (err) {
      console.error("❌ Error en getMyAppointments:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  