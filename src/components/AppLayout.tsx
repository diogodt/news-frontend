import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
} from "@mui/material";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Chip } from "@mui/material";

const brandLogo = "https://activeview.io/wp-content/uploads/2025/11/Logo.svg";
const headerBg = "#252b35";
const headerBorder = "#1e232c";
const grafiteText = "#1f2933";
const lightText = "#e5e7eb";

const navLinks = [
  { to: "/app/search", label: "Discover", icon: <TravelExploreIcon fontSize="small" /> },
  { to: "/app/collections", label: "Collections", icon: <CollectionsBookmarkIcon fontSize="small" /> },
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const missingApiKey = !user?.newsApiToken;

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (missingApiKey && !location.pathname.includes("/profile") && !location.pathname.includes("/onboarding")) {
      navigate("/app/profile", { replace: true, state: { reason: "missing_api_key" } });
    }
  }, [missingApiKey, location.pathname, navigate]);

  return (
    <Box sx={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ backgroundColor: headerBg, borderBottom: `1px solid ${headerBorder}`, color: lightText }}
      >
        <Toolbar>
          <Stack direction="row" spacing={1} alignItems="center" className="cursor-pointer" onClick={() => navigate("/app/search")}>
            <img src={brandLogo} alt="ActiveView" />
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  startIcon={link.icon}
                  color="inherit"
                  variant={active ? "contained" : "text"}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 600,
                    color: active ? grafiteText : lightText,
                    backgroundColor: active ? "#61CE70" : "transparent",
                    "& svg": { color: active ? grafiteText : lightText },
                    "&:hover": { backgroundColor: active ? "#55b864" : "rgba(255,255,255,0.08)" },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
            <Stack direction="row" spacing={0.5} alignItems="center">
              {missingApiKey && (
                <Chip
                  color="default"
                  variant="filled"
                  icon={<WarningAmberIcon fontSize="small" sx={{ color: "#4b5563" }} />}
                  label="Add your NewsAPI key"
                  sx={{ bgcolor: "#fff", color: "#4b5563", fontWeight: 600 }}
                  onClick={() => navigate("/app/profile")}
                />
              )}
              <Tooltip title={user?.email || ""}>
                <Avatar sx={{ bgcolor: "#014260", color: "#fff" }}>{initials || "U"}</Avatar>
              </Tooltip>
              <IconButton aria-label="user menu" color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: lightText }}>
                <ExpandMoreIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    navigate("/app/profile");
                  }}
                >
                  <ManageAccountsIcon fontSize="small" className="mr-2" />
                  View profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogoutIcon fontSize="small" className="mr-2" />
                  Logout
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
};
