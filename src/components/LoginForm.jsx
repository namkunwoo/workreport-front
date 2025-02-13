import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';  // 여기에 추가!
import '../styles/LoginForm.css'; 

const LoginForm = () => {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const navigate = useNavigate();  // 여기에 선언!

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    navigate('/dashboard');  // 여기서 /dashboard로 이동
  };

  return (
    <Box className="login-container" display="flex" flexDirection="column" alignItems="center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box className="login-box" p={3} borderRadius={2} boxShadow={3} bgcolor="white">
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="ID"
              name="id"
              variant="outlined"
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              name="password"
              variant="outlined"
              margin="normal"
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </form>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Link href="/register" variant="body2">
              Sign Up
            </Link>
            <Link href="/findPwd" variant="body2">
              Forgot Password?
            </Link>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginForm;
