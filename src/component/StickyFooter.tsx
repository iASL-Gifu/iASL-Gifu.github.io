import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { defaultTheme } from '../Theme';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" textAlign={'center'}>
      {'Copyright © '}
      iASL in Gifu University
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}



export const StickyFooter = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body1" textAlign={'center'}>
            1-1 Yanagido, Gifu City 501-1193, JAPAN Phone; +81-(0)58-230-1111
            </Typography>
            <Copyright />
          </Container>
        </Box>
    </ThemeProvider>
  );
}