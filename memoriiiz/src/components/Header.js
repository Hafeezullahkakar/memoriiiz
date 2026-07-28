import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Tooltip,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material/styles";
import { MdLogout, MdLogin, MdPersonAdd } from "react-icons/md";

import { ColorModeContext } from "../theme/ThemeContext";
import { useTokens } from "../theme/tokens";
import { selectUser, selectRefreshToken, selectIsAuthenticated, clearSession, setSession } from "../redux/authSlice";
import { authApi, onAuthEvent } from "../utils/api";
import LogoMark from "./LogoMark";

const NAV = [
  { label: "Words", to: "/words" },
  { label: "Play", to: "/play" },
  { label: "Practice", to: "/practice" },
  { label: "Reads", to: "/reads" },
  { label: "Ask AI", to: "/askai" },
  { label: "Add Word", to: "/addword" },
  { label: "About", to: "/about" },
];

function Header() {
  const theme = useTheme();
  const t = useTokens();
  const colorMode = React.useContext(ColorModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const refreshToken = useSelector(selectRefreshToken);
  const isLoggedIn = useSelector(selectIsAuthenticated);

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  // Listen for auth events from the axios interceptor (e.g. refresh failed).
  React.useEffect(() => {
    const unsub = onAuthEvent((event, payload) => {
      if (event === "logout") {
        dispatch(clearSession());
        toast.info("Signed out — please log in again.");
      } else if (event === "refreshed") {
        dispatch(setSession({ accessToken: payload?.accessToken, user: payload?.user }));
      }
    });
    return unsub;
  }, [dispatch]);

  const openNav = (e) => setAnchorElNav(e.currentTarget);
  const closeNav = () => setAnchorElNav(null);
  const openUser = (e) => setAnchorElUser(e.currentTarget);
  const closeUser = () => setAnchorElUser(null);

  const isActive = (to) => {
    if (to === "/words") return ["/words", "/wordslist", "/gre"].includes(location.pathname);
    if (to === "/play") return ["/play", "/greplay"].includes(location.pathname);
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const handleLogout = async () => {
    closeUser();
    closeNav();
    if (refreshToken) authApi.logout(refreshToken);
    dispatch(clearSession());
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 68 } }}>
          {/* Logo + wordmark */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: t.colors.text,
              mr: { xs: 1, md: 4 },
              flexShrink: 0,
            }}
          >
            <LogoMark size={30} wordmarkSize={19} />
          </Box>

          {/* Mobile hamburger */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={theme.palette.mode === "light" ? "Dark mode" : "Light mode"}>
              <IconButton onClick={colorMode.toggleColorMode} sx={{ color: t.colors.text }}>
                {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={openNav} sx={{ color: t.colors.text }}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={closeNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: t.radii.lg,
                  border: `1px solid ${t.colors.border}`,
                  minWidth: 220,
                  boxShadow: t.shadows.md,
                },
              }}
            >
              {NAV.map((item) => (
                <MenuItem
                  key={item.to}
                  onClick={closeNav}
                  component={Link}
                  to={item.to}
                  selected={isActive(item.to)}
                  sx={{
                    fontWeight: 700,
                    py: 1.25,
                    color: isActive(item.to) ? t.colors.primary : t.colors.text,
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
              <Divider sx={{ my: 0.5, borderColor: t.colors.border }} />
              {isLoggedIn ? (
                <MenuItem onClick={handleLogout} sx={{ fontWeight: 700, py: 1.25, color: t.colors.danger }}>
                  <MdLogout style={{ marginRight: 8 }} /> Sign out
                </MenuItem>
              ) : (
                [
                  <MenuItem key="login" onClick={closeNav} component={Link} to="/login" sx={{ fontWeight: 700, py: 1.25 }}>
                    <MdLogin style={{ marginRight: 8 }} /> Sign in
                  </MenuItem>,
                  <MenuItem key="signup" onClick={closeNav} component={Link} to="/signup" sx={{ fontWeight: 700, py: 1.25, color: t.colors.primary }}>
                    <MdPersonAdd style={{ marginRight: 8 }} /> Create account
                  </MenuItem>,
                ]
              )}
            </Menu>
          </Box>

          {/* Desktop nav */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 0.5, alignItems: "center" }}>
            {NAV.map((item) => {
              const active = isActive(item.to);
              return (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  disableRipple
                  sx={{
                    color: active ? t.colors.primary : t.colors.textMuted,
                    fontWeight: 700,
                    fontSize: 14.5,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: t.radii.md,
                    bgcolor: active ? t.colors.primarySoft : "transparent",
                    "&:hover": { bgcolor: t.colors.hover, color: t.colors.text },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Desktop right cluster */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Tooltip title={theme.palette.mode === "light" ? "Dark mode" : "Light mode"}>
              <IconButton onClick={colorMode.toggleColorMode} sx={{ color: t.colors.text }}>
                {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            {isLoggedIn ? (
              <>
                <Tooltip title={user?.name || user?.email || "Account"}>
                  <IconButton onClick={openUser} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: t.colors.primary,
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      {(user?.name || user?.email || "U")[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={closeUser}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{
                    sx: { mt: 1, borderRadius: t.radii.lg, minWidth: 220, boxShadow: t.shadows.md },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>
                      {user?.name || "You"}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: t.colors.textMuted }}>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: t.colors.border }} />
                  <MenuItem onClick={handleLogout} sx={{ fontWeight: 700, py: 1.25, color: t.colors.danger }}>
                    <MdLogout style={{ marginRight: 8 }} /> Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    color: t.colors.text,
                    fontWeight: 700,
                    borderRadius: t.radii.md,
                    "&:hover": { bgcolor: t.colors.hover },
                  }}
                >
                  Sign in
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  sx={{
                    fontWeight: 800,
                    borderRadius: t.radii.md,
                    background: t.gradients.primary,
                    boxShadow: t.shadows.primary,
                    px: 2,
                  }}
                >
                  Sign up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
