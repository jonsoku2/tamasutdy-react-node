const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Identicon = require('identicon.js');

const Schema = mongoose.Schema;

const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'username은 필수 사항입니다.'],
      trim: true,
      max: [32, '최대 32글자까지 입력해주세요. '],
    },
    email: {
      type: String,
      required: [true, 'email은 필수 사항입니다.'],
      trim: true,
      validate: [validateEmail, '정상적인 이메일을 입력해주세요. '],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '정상적인 이메일을 입력해주세요. '],
      unique: [true, '이메일이 중복되었습니다. '],
    },
    avatar: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'password는 필수 사항입니다. '],
      trim: true,
      min: [6, '비밀번호는 최소 6자 이상입니다. '],
    },
    posts: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', function (next) {
  console.log('*** <pre> identicon ***');
  const data = new Identicon(this.email, {
    foreground: [0, 0, 0, 255],
    background: [255, 255, 255, 255],
    margin: 0.2,
    size: 32,
    format: 'svg',
  }).toString();
  this.avatar = `data:image/svg+xml;base64,${data}`;
  next();
});

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    console.log('*** <pre> password hashing middleware from user model ***');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
  } catch (error) {
    console.log(error);
  }
});

userSchema.post('remove', async function (next) {
  try {
    const Post = require('./post.model');
    await Post.remove({ user: this._id }).exec();
    next();
  } catch (error) {
    console.log(error);
  }
});

userSchema.methods.createJwt = function () {
  const payload = {
    _id: this._id,
    email: this.email,
  };
  const token = jwt.sign(payload, process.env.NODE_JWT_SECRET);
  return token;
};

userSchema.methods.comparePassword = async function (inputPassword) {
  try {
    const isMatched = await bcrypt.compare(inputPassword, this.password);
    return isMatched;
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
