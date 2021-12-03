import React, { useReducer, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Index from './index'
import { useRouter } from 'next/router';
import { useServer } from '../lib/server';



const Login = () => {
  const server = useServer();
  const router = useRouter();
  const [formValue, setformValue] = React.useState({
    email: "",
    password: ""
  });

  async function submitForm(event: React.KeyboardEvent<HTMLInputElement>) {
    setformValue({ ...formValue, [event.currentTarget.type]: event.currentTarget.value});

    const response = server.signin(formValue.email, formValue.password);

    
    response.then(res => {
      router.push({
        pathname: './dashboard'
      })
   })
      response.catch(err => {
        alert(err.msg + ": " + err.code)
        console.error(err.msg + ": " + err.code)
    });

    setformValue({ ...formValue, [event.currentTarget.type]: event.currentTarget.value});
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setformValue({ ...formValue, [event.currentTarget.type]: event.currentTarget.value })
  };

  return (
    <Box width="100%"> 
      <Index  />
    <Grid align="center" padding="40px">
      <Box sx={{ flexGrow: 1 }} maxWidth="500px">
        <Paper elevation={3}>
          <form id="formSubmit" noValidate autoComplete="off">
            <Card>
              <CardHeader title="Login" />
              <CardContent>
                <div>
                  <TextField
                    fullWidth
                    id="email"
                    type="email"
                    value={formValue.email}
                    label="Email"
                    placeholder="Email"
                    margin="normal"
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    id="password"
                    type="password"
                    value={formValue.password}
                    label="Password"
                    placeholder="Password"
                    margin="normal"
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  size="large"
                  color="inherit"
                  className="Btn"
                  onClick={submitForm}
                  enabled
                >
                  Login
                </Button>
              </CardActions>
            </Card>
          </form>
        </Paper>
      </Box>
    </Grid>
    </Box>
  );
}

export default Login;