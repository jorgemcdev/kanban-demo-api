import multer from 'multer';

const uploadAvatar = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname);
    }
  });
  multer({ storage }).single('avatar');
};

export default { uploadAvatar };
