import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { StickyFooter } from '../component/StickyFooter';
import { Header } from '../component/Header';
import { defaultTheme } from '../Theme';
import { CustomizedTables } from '../component/Table';
import HomeImg from '../images/HomeImg.jpg'

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export const Home = () =>{
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '60vh',
          backgroundImage: "url(" + HomeImg + ")",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative" 
        }}
      >
        <CssBaseline />
        <Header />
        <Container component="main" sx={{ mt: 1, mb: 2 }} maxWidth="xl">
          <Typography variant="h2" component="h1" gutterBottom sx={{color: 'white', WebkitTextStrokeWidth: '1px', WebkitTextStrokeColor: 'black', position: 'absolute',bottom: '20vh'}}>
          Intelligent Autonomous Systems Lab in Gifu University
          </Typography>
        </Container>
      </Box>
      <Typography variant="h4" sx={{color: 'black', mt: 5, mb: 10,textAlign: 'center', lineHeight: 2.0}}>
        Welcome to iASL! <br/>
        We are doing research on autonomous driving and robotics.
      </Typography>
      <Typography variant="h3" sx={{color: 'black', mt: 1, mb: 6, ml: 5, mr: 5, textAlign: 'left', lineHeight: 3.0}} >
        <div id='Event'>Our history</div>
        <CustomizedTables/>
      </Typography>
      <StickyFooter />
    </ThemeProvider>
  );
}