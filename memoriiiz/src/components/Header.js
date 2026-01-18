import { useSelector } from "react-redux";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../theme/ThemeContext";

import { selectUser, selectToken } from "../redux/authSlice";
import { MdAutoAwesome } from "react-icons/md";
const pages = ["GRE Prep", "GRE Play", "General Vocabulary", "Contribute Word", "About"];
// const settings = ["Profile", "Account", "Dashboard", "Logout"];
const settings = ["Account", "Logout"];

function Header() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const userr = useSelector(selectUser);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const [user, setUser] = React.useState(false);

  const usr = localStorage.getItem("user");

  console.log("redux store data in header:", useSelector(selectUser) , " and ", useSelector(selectToken))

  React.useEffect(() => {
    if (usr || userr) {
      setUser(true);
    }
  });

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ 
      backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(10, 25, 41, 0.8)', 
      backdropFilter: "blur(10px)", 
      color: theme.palette.text.primary, 
      borderBottom: `1px solid ${theme.palette.divider}` 
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: { xs: "none", md: "flex" }, mr: 1, color: 'primary.main' }}>
            <MdAutoAwesome size={24} />
          </Box>

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 4,
              display: { xs: "none", md: "flex" },
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Link
              to="/"
              style={{ color: theme.palette.text.primary, textDecoration: "none" }}
            >
              Memoriiiz
            </Link>
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => {
                let path = page.toLowerCase();
                if (page === "GRE Prep") path = "gre";
                if (page === "GRE Play") path = "greplay";
                if (page === "General Vocabulary") path = "wordslist";
                if (page === "Contribute Word") path = "addword";
                
                return (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Link
                      to={`/${path}`}
                      style={{ textDecoration: "none", color: "inherit", width: '100%' }}
                    >
                      <Typography textAlign="center">{page}</Typography>
                    </Link>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1, color: 'primary.main' }}>
             <MdAutoAwesome size={24} />
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Link
              to="/"
              style={{ color: theme.palette.text.primary, textDecoration: "none" }}
            >
              Memoriiiz
            </Link>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => {
              let path = page.toLowerCase();
              if (page === "GRE Prep") path = "gre";
              if (page === "GRE Play") path = "greplay";
              if (page === "General Vocabulary") path = "wordslist";
              if (page === "Contribute Word") path = "addword";

              return (
                <Button
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ 
                    my: 2, 
                    color: theme.palette.text.secondary, 
                    display: "block", 
                    textTransform: 'none', 
                    fontWeight: 600,
                    px: 2,
                    "&:hover": { color: 'primary.main' }
                  }}
                >
                  <Link
                    to={`/${path}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {page}
                  </Link>
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`Switch to ${theme.palette.mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            {user ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt="Remy Sharp"
                      src="https://pps.whatsapp.net/v/t61.24694-24/378065211_1258309461536733_5939401187160746792_n.jpg?ccb=11-4&oh=01_AdQX6Onf_EUeDnmUz6RcW2250JW3_gYy-M-atkrXeKpgxg&oe=652E70F4&_nc_sid=000000&_nc_cat=107"
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                      <Typography textAlign="center">
                        <Link
                          // to={`/${page.trim().toLowerCase().replace(/\s/g, "")}`}
                          to="/"
                          style={{ textDecoration: "none", color: "inherit" }}
                          sx={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            p: "16px",
                          }}
                        >
                          {setting}
                        </Link>
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <>
               
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
