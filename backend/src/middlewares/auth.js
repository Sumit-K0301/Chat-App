import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {

    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }   

};

export default verifyToken;
