import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import { FC } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Menu from '@mui/material/Menu';
import PastSubmissions from '@mui/icons-material/AccessTime';
import MoreIcon from '@mui/icons-material/MoreVert';
import Logout from '@mui/icons-material/Logout';
import { useRouter} from 'next/router';
import { useServer } from '../../lib/server';




const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

type PastSubProps = {
  analysisID: string;
  date: string[];
};

type analysisID = {
  ids : string[]
}

const PastSub : FC<PastSubProps> = ({analysisID, date, ...props} : PastSubProps) => {

  return(
      
      <p><h4><b>Submitted:</b></h4>{date}</p>

    
  ) 
};


export default function PrimarySearchAppBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [analysesID, setAnalysesID] = React.useState<analysisID | null>(null);
  const [isPastSubmissions, setIsPastSubmissions] = React.useState<Boolean>(false);
  const router = useRouter();
  const server = useServer();
  let pastSubmissions = undefined;

  const handlePastSub = (analysesID : string) =>{
      router.push({
        pathname: '/analyzer',
        query: {
          analysis_id: analysesID
        }
      })
  }

  React.useEffect(() =>{
    fetch('/user/get_analyses')
    .then(res => res.json()
      
    ).then((success : analysisID) => 
      {

        console.log(success);
        Object.entries(success!).map(([i,a])=>{
          console.log(a);
          if(a.length !== 0){setIsPastSubmissions(true)}
        })
        setAnalysesID(success);
       
        
       
      })
    .catch(err => console.log(err));

  }, [])

  if(analysesID !== null){
      
      if(isPastSubmissions){
        let count = 0;
        pastSubmissions = Object.entries(analysesID!).map(([analy,d]) =>
        <MenuItem onClick = {() => handlePastSub(analy)}>
        <PastSub key = {`${analy}`} analysisID = {analy} date = {d} />
        </MenuItem>)
      }
      else{
        pastSubmissions = <MenuItem><p>No Past Submissions</p></MenuItem>
     } 
    }
 

 
  


  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogOut = () => {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('../login');
  }

  const handleSettings = () =>{
        router.push('./test');
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >

      {pastSubmissions}
    </Menu>
  );

    return (
        <Box sx={{ flexGrow: 1, paddingBottom: 5 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Code Analyzer
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Tooltip title = "Past Submissions">
                <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                sx={{ mr: 2 }}
                onClick={handleMobileMenuOpen}
              >
                <PastSubmissions/>
              </IconButton>
              </Tooltip>
              <Tooltip title = "Log Out">
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleLogOut}
                  color="inherit"
                >
                  <Logout />
                </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  
                  color="inherit"
                >
                  <MoreIcon />
                </IconButton>
                
              </Box>
            </Toolbar>
          </AppBar>
          {renderMobileMenu}
          {renderMenu}
        </Box>
      );
  
  
}
