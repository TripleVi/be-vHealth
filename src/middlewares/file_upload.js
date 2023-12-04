import multer, { diskStorage } from "multer";

const upload = () => {
    const storage = diskStorage({
        filename: (req, file, cb) => {
            // var index = file.originalname.lastIndexOf(".");
            // var extension = file.originalname.substr(index+1);
            cb(null, file.originalname)
        }
    });
    const limits = {
        fileSize: 1024 * 1024 * 2,
        files: 20,
        fields: 1,
    }
    return multer({storage, limits}).fields([
        { name: "photos" },
        { name: "mapImg", maxCount: 1 },
    ]);
}

export default upload()