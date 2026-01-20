import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

    // req.body.docId = decoded.id;
    req.user = { docId: decoded.id };

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
