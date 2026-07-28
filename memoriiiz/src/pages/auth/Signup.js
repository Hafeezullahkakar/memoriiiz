import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowForward,
} from "react-icons/md";

import { useTokens } from "../../theme/tokens";
import { authApi } from "../../utils/api";
import { setSession } from "../../redux/authSlice";
import LogoMark from "../../components/LogoMark";

const Signup = () => {
  const t = useTokens();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(formData);
      // Backend returns tokens on register so we log the user in immediately.
      dispatch(
        setSession({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
      toast.success("Welcome to Memoriiiz!");
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        "Could not create the account.";
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
            Create your account
          </Typography>
          <Typography sx={{ color: t.colors.textMuted, fontSize: 14, mb: 3 }}>
            Save your progress and unlock personal modules.
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
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                fullWidth
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdPerson color={t.colors.textMuted} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
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
                helperText="At least 6 characters"
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
                {loading ? "Creating…" : "Create account"}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3, borderColor: t.colors.border }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: t.colors.textMuted, fontSize: 14 }}>
              Already have one?{" "}
              <Box
                component={Link}
                to="/login"
                sx={{ color: t.colors.primary, fontWeight: 800, textDecoration: "none" }}
              >
                Sign in
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
