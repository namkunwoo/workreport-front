import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css'; 

const Register = () => {
  const [formData, setFormData] = useState({ id: '', password: '', confirmPassword: '', name: '', email: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await axios.post('/local/api/auth/register', {
        username: formData.id,
        password: formData.password,
        name: formData.name,
        email: formData.email,
      });
      alert('Registration successful!');
      navigate('/login');  // 회원가입 성공 시 로그인 페이지로 이동
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box className="register-container" display="flex" flexDirection="column" alignItems="center">
      <Box className="register-box" p={3} borderRadius={2} boxShadow={3} bgcolor="white">
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleRegister}>
          <TextField fullWidth label="ID" name="id" variant="outlined" margin="normal" onChange={handleChange} required />
          <TextField fullWidth type="password" label="Password" name="password" variant="outlined" margin="normal" onChange={handleChange} required />
          <TextField fullWidth type="password" label="Confirm Password" name="confirmPassword" variant="outlined" margin="normal" onChange={handleChange} required />
          <TextField fullWidth label="Name" name="name" variant="outlined" margin="normal" onChange={handleChange} required />
          <TextField fullWidth type="email" label="Email" name="email" variant="outlined" margin="normal" onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
        <Box display="flex" justifyContent="center" mt={2}>
          <Link href="/login" variant="body2">
            Already have an account? Login
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
