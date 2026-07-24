import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material/styles";

import { ColorModeContext } from "../theme/ThemeContext";
import { useTokens } from "../theme/tokens";
import { selectUser, selectToken } from "../redux/authSlice";
import LogoMark from "./LogoMark";

const NAV = [
  { label: "Words", to: "/words" },
  { label: "Play", to: "/play" },
  { label: "Practice", to: "/practice" },
  { label: "Ask AI", to: "/askai" },
  { label: "Add Word", to: "/addword" },
  { label: "About", to: "/about" },
];

function Header() {
  const theme = useTheme();
  const t = useTokens();
  const colorMode = React.useContext(ColorModeContext);
  const location = useLocation();

  const reduxUser = useSelector(selectUser);
  const reduxToken = useSelector(selectToken);
  const lsUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const isLoggedIn = !!(reduxUser || reduxToken || lsUser);

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const openNav = (e) => setAnchorElNav(e.currentTarget);
  const closeNav = () => setAnchorElNav(null);
  const openUser = (e) => setAnchorElUser(e.currentTarget);
  const closeUser = () => setAnchorElUser(null);

  const isActive = (to) => {
    if (to === "/words") return ["/words", "/wordslist", "/gre"].includes(location.pathname);
    if (to === "/play") return ["/play", "/greplay"].includes(location.pathname);
    return location.pathname === to || location.pathname.startsWith(to + "/");
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
                  minWidth: 200,
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
            {isLoggedIn && (
              <>
                <Tooltip title="Account">
                  <IconButton onClick={openUser} sx={{ p: 0 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: t.colors.primarySoft, color: t.colors.primary, fontWeight: 800 }}>
                      {reduxUser?.name?.[0]?.toUpperCase() || "U"}
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
                    sx: { mt: 1, borderRadius: t.radii.lg, minWidth: 160, boxShadow: t.shadows.md },
                  }}
                >
                  <MenuItem onClick={closeUser} component={Link} to="/" sx={{ fontWeight: 700 }}>
                    Account
                  </MenuItem>
                  <MenuItem onClick={closeUser} component={Link} to="/" sx={{ fontWeight: 700 }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
