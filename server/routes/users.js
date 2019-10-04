const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Session = require('../models/session');
const { authenticate } = require('../middleware/authenticate');
const { csrfCheck } = require('../middleware/csrfCheck');
const { initSession, isEmail } = require('../utils/utils');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, uniqueNumber } = req.body;
    if (!isEmail(email)) {
      throw new Error('O email deve ser válido.');
    }
    if (typeof password !== 'string') {
      throw new Error('A senha deve ser do tipo texto.');
    }
    const user = new User({ email, password, uniqueNumber });
    const persistedUser = await user.save();
    const userId = persistedUser._id;

    const session = await initSession(userId);

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1209600000,
        secure: process.env.NODE_ENV === 'production',
      })
      .status(201)
      .json({
        title: 'OK',
        detail: 'User registered successfully!',
        csrfToken: session.csrfToken,
      });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          type: 'error',
          title: 'Registration Error',
          detail: 'Something went wrong during registration process.',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({
        errors: [
          {
            type: 'error',
            title: 'ERRO',
            detail: 'The e-mail should be valid.',
          },
        ],
      });
    }
    if (typeof password !== 'string') {
      return res.status(400).json({
        errors: [
          {
            type: 'error',
            title: 'ERRO',
            detail: 'The password should be a text',
          },
        ],
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }
    const userId = user._id;

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }

    const session = await initSession(userId);
    res.set('Access-Control-Allow-Origin', ['*']);
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: false,
        maxAge: 1209600000,
        secure: true,
      })
      .json({
        title: 'OK',
        detail: 'Logged in successfully!',
        token: session.token,
      });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          type: 'error',
          title: 'ERRO',
          detail: 'Please verify your e-mail and password.',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { userId } = req.session;
    const user = await User.findById({ _id: userId }, { email: 1, name: 1 });

    res.json({
      title: 'OK',
      detail: 'User authenticated successfully!',
      user,
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          type: 'error',
          title: 'Unauthorized',
          detail: 'Not authorized to access this route',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.put('/update', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { name: "Naomi" } },
      { new: true }
    );

    res.json({
      title: 'Authentication successful',
      detail: 'Successfully authenticated user',
      user,
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          type: 'error',
          title: 'Unauthorized',
          detail: 'Not authorized to access this route',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.delete('/me', authenticate, csrfCheck, async (req, res) => {
  try {
    const { userId } = req.session;
    const { password } = req.body;
    if (typeof password !== 'string') {
      throw new Error();
    }
    const user = await User.findById({ _id: userId });

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }

    await Session.expireAllTokensForUser(userId);
    res.clearCookie('token');
    await User.findByIdAndDelete({ _id: userId });
    res.json({
      title: 'Account Deleted',
      detail: 'Account with credentials provided has been successfuly deleted',
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          type: 'error',
          title: 'Invalid Credentials',
          detail: 'Check email and password combination',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.put('/logout', authenticate, async (req, res) => {
  try {
    const { session } = req;
    await session.expireToken(session.token);
    res.clearCookie('token');

    res.json({
      title: 'OK',
      detail: 'Logged out successfully!',
    });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          type: 'error',
          title: 'ERRO',
          detail: 'Error on Logout',
          errorMessage: err.message,
        },
      ],
    });
  }
});

module.exports = router;
