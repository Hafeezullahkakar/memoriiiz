import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
} from "@mui/material";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from "react-icons/md";

import { useTokens } from "../../theme/tokens";
import { authApi } from "../../utils/api";
import { setSession } from "../../redux/authSlice";
import LogoMark from "../../components/LogoMark";

const Login = () => {
  const t = useTokens();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(formData);
      dispatch(
        setSession({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
      toast.success(`Welcome back, ${data.user?.name || data.user?.email || ""}`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        "Login failed. Check your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: t.radii.md,
      bgcolor: t.colors.bg,
      "& fieldset": { borderColor: t.colors.border },
      "&:hover fieldset": { borderColor: t.colors.borderStrong },
      "&.Mui-focused fieldset": { borderColor: t.colors.primary },
    },
  };

  return (
    <Box sx={{ bgcolor: t.colors.bg, minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LogoMark size={44} wordmarkSize={22} />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: t.radii.lg,
            border: `1px solid ${t.colors.border}`,
            bgcolor: t.colors.surface,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: "-0.02em" }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: t.colors.textMuted, fontSize: 14, mb: 3 }}>
            Sign in to sync your words, bookmarks, and progress.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: t.radii.md,
                bgcolor: t.colors.dangerSoft,
                color: t.colors.danger,
                border: `1px solid ${t.colors.danger}`,
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
                fullWidth
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdEmail color={t.colors.textMuted} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdLock color={t.colors.textMuted} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={<MdArrowForward />}
                sx={{
                  py: 1.25,
                  fontWeight: 800,
                  borderRadius: t.radii.md,
                  background: t.gradients.primary,
                  boxShadow: t.shadows.primary,
                  mt: 1,
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3, borderColor: t.colors.border }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: t.colors.textMuted, fontSize: 14 }}>
              Don't have an account?{" "}
              <Box
                component={Link}
                to="/signup"
                sx={{ color: t.colors.primary, fontWeight: 800, textDecoration: "none" }}
              >
                Sign up
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
