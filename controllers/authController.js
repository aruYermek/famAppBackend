const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');


exports.registerAdmin = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const phoneRegex = /^\+7\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone must start with +7 and be 12 digits long' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role: 'admin',
      emailVerified: true, // Admin doesn't need email verification
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ message: 'Admin registered successfully', token, user });
  } catch (error) {
    console.error('Error registering admin:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.register = async (req, res) => {
  try {
    console.log('🔵 Incoming request:', req.body);

    const { name, phone, email } = req.body;

    
    if (!name || name.trim().length < 1) {
      console.log('❌ Error: Name too short');
      return res.status(400).json({ message: 'Name must have at least 1 character' });
    }


    const phoneRegex = /^\+7\d{10}$/;
    if (!phoneRegex.test(phone)) {
      console.log('❌ Error: Invalid phone number');
      return res.status(400).json({ message: 'Phone must start with +7 and be 12 digits long' });
    }

    let userWithPhone = await User.findOne({ phone });
    if (userWithPhone) {
      console.log('⚠️ Phone number already registered:', userWithPhone);
      return res.status(400).json({ message: 'Phone number is already registered' });
    }

  
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Error: Invalid email');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let user = await User.findOne({ email });

    if (user) {
      console.log('⚠️ Email already registered:', user);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    user = new User({ name, phone, email, verificationCode, verificationCodeExpires });
    await user.save();
    console.log('✅ User created:', user);

    await sendEmail(email, 'Email Verification Code', `Your code: ${verificationCode}`);
    console.log('📩 Verification code sent to email:', email);

    return res.status(201).json({ message: 'Verification code sent to email', user });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    console.log('🔵 Login request:', req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      console.log('❌ No password set for this user');
      return res.status(400).json({ message: 'No password set. Please reset your password' });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Incorrect password');
      return res.status(400).json({ message: 'Incorrect password' });
    }

   
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ Login successful, token generated');
    return res.status(200).json({ message: 'Login successful', token, user });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

 
  
exports.verifyEmail = async (req, res) => {
    try {
      const { email, code } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }
  
      if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
        return res.status(400).json({ message: 'Неверный или истекший код' });
      }
  
      user.emailVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save();
  
      res.json({ message: 'Email подтвержден' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  };
exports.resendCode = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }
  
      const newCode = crypto.randomInt(100000, 999999).toString();
      user.verificationCode = newCode;
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  
      await user.save();
      await sendEmail(email, 'Email Verification Code', `Your new code: ${newCode}`);
  
      res.json({ message: 'Новый код отправлен' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  };

exports.createPassword = async (req, res) => {
  try {
    console.log('🔵 Incoming request:', req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Error: User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.emailVerified) {
      console.log('❌ Error: Email not verified:', email);
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      console.log('❌ Error: Weak password');
      return res.status(400).json({
        message: 'Password must have at least 6 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      });
    }

    // Явное хеширование пароля
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log('✅ Password set for user:', email);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Password set successfully', token });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
};

  
  

  // Verify email with the verification code
exports.verifyCode = async (req, res) => {
  try {
    console.log('🔵 Incoming request:', req.body);

    const { email, verificationCode } = req.body;

    
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Error: User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user);

    
    if (new Date() > new Date(user.verificationCodeExpires)) {
      console.log('⚠️ Code expired');
      return res.status(400).json({ message: 'Verification code expired' });
    }

    console.log(`📌 Received code: "${verificationCode}", Code in DB: "${user.verificationCode}"`);

    
    if (String(verificationCode).trim() !== String(user.verificationCode).trim()) {
      console.log('❌ Error: Incorrect verification code');
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    console.log('✅ Verification successful, updating emailVerified');

    
    user.emailVerified = true;
    user.verificationCode = null; 
    user.verificationCodeExpires = null; 
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    console.log('🔵 Forgot password request:', req.body);

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

   
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Код действует 10 минут

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

   
    await sendEmail(email, 'Password Reset Code', `Your verification code is: ${verificationCode}`);

    console.log('✅ Password reset code sent:', verificationCode);

    return res.status(200).json({ message: 'Verification code sent successfully' });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
    console.log('🔵 Verifying reset code:', req.body);

    const { email, verificationCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (new Date() > new Date(user.verificationCodeExpires)) {
      console.log('⚠️ Code expired');
      return res.status(400).json({ message: 'Verification code expired' });
    }

    if (String(verificationCode).trim() !== String(user.verificationCode).trim()) {
      console.log('❌ Incorrect verification code');
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    console.log('✅ Code verified successfully');

    return res.status(200).json({ message: 'Verification successful' });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    console.log('🔵 Resetting password:', req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      console.log('❌ Error: Weak password');
      return res.status(400).json({
        message: 'Password must have at least 6 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      });
    }

    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    console.log('✅ Password reset successful');

    return res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};