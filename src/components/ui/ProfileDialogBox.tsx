import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

export interface ProfileDialogBoxProps {
  open: boolean;
  onClose: () => void; // Simplified onClose
  setOpen: (value: boolean) => void;
}

export function ProfileDialogBox(props: ProfileDialogBoxProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth();
  const { onClose, open, setOpen } = props;

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleLogout = () => {
    logout();
    handleClose(); // Also close the dialog on logout
    navigate("/");
  };

  return (
    <Popover
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column"}}>
        <Box sx={{ display: "flex", flexDirection: "row", p: 2 }}>
          <AccountCircleIcon />  
          {/* Display the actual user's email, with a fallback */}
          <Typography>{user ? user.email : "Loading..."}</Typography>
        </Box>
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "row", p: 2, cursor:"pointer" }}  onClick={handleLogout}>
          <LogoutIcon style={{color:"red"}}/>  
          <Typography sx={{color:"red"}}>Log Out</Typography>
        </Box>
      </Box>
    </Popover>
  );
}