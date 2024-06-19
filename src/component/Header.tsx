import { Button } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

export const Header = () => {

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            iASL
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Button sx={{ color: '#000' }}>
                {"Home"}
              </Button>
              <Button sx={{ color: '#000' }}  href="#Event">
                {"Event"}
              </Button>
              <Button sx={{ color: '#000' }}>
                {"Contact"}
              </Button>
          </Box>
        </Toolbar>

      </AppBar>
    </Box>
  );
}
