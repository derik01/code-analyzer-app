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
import { useState } from "react";
import { DefaultPageProps } from "./_app";
import { useRouter } from 'next/router';
import { useServer, ERRCODE } from '../lib/server';

export type State = {
  email: string,
  password: string,
  errmsg: string,
  isButtonDisabled: boolean,
  helperText: string,
  isError: boolean
};

export const initialState: State = {
  email: "",
  password: "",
  errmsg: "",
  isButtonDisabled: true,
  helperText: "",
  isError: false
};

export type Action =
  | { type: "setUsername", payload: string }
  | { type: "setPassword", payload: string }
  | { type: "setIsButtonDisabled", payload: boolean }
  | { type: 'INVALID_CREDENTIALS', payload: string }
  | { type: 'FETCH_FAILED', payload: string }
  | { type: 'ACCOUNT_EXISTS', payload: string }

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setUsername":
      return {
        ...state,
        email: action.payload
      };
    case "setPassword":
      return {
        ...state,
        password: action.payload
      };
    case "setIsButtonDisabled":
      return {
        ...state,
        isButtonDisabled: action.payload
      };
    case 'INVALID_CREDENTIALS':
      return {
        ...state,
        errmsg: action.payload
      };
      case 'FETCH_FAILED':
      return {
        ...state,
        errmsg: action.payload
      };
      case 'ACCOUNT_EXISTS':
      return {
        ...state,
        errmsg: action.payload
      };
      
  }
};

const Register = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [formValue, setformValue] = React.useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    if (state.email.trim() && state.password.trim()) { 
      dispatch({
        type: "setIsButtonDisabled",
        payload: false
      });
    } else {
      dispatch({
        type: "setIsButtonDisabled",
        payload: true
      });
    }
  }, [state.email, state.password]);

  //-------------------------------------------------------------------------------------------
  const handleSignup = () => {
    const server = useServer();
    const router = useRouter();  

     const valid = server.signup(state.email, state.password);

     valid.then(res => {
        router.push({
          pathname: '/dashboard'
        })
     })

     valid.catch(err => {
       dispatch({
       type: err.code,
       payload: `Failed to create account ${err.msg}`
     })
    });
  }
  //-------------------------------------------------------------------------------------------

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      state.isButtonDisabled || handleSignup();
    }
  };

  const handleUsernameChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    dispatch({
      type: "setUsername",
      payload: event.target.value
    });
    setformValue({ ...formValue, [event.type]: event.target.value });
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    dispatch({
      type: "setPassword",
      payload: event.target.value
    });
    setformValue({ ...formValue, [event.type]: event.target.value });
  };

  return (
    <Box width="100%"> 
      <Index  />
    <Grid align="center" padding="40px">
      <Box sx={{ flexGrow: 1 }} maxWidth="500px">
        <Paper elevation={3}>
          <form id="formSubmit" noValidate autoComplete="off">
            <Card>
              <CardHeader title="Sign Up" />
              <CardContent>
                <div>
                  <TextField
                    error={state.isError}
                    fullWidth
                    id="username"
                    type="email"
                    label="Username"
                    placeholder="Username"
                    margin="normal"
                    onChange={handleUsernameChange}
                    onKeyPress={handleKeyPress}
                  />
                  <TextField
                    error={state.isError}
                    fullWidth
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Password"
                    margin="normal"
                    helperText={state.helperText}
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  className="Btn"
                  id="validate"
                  type="validate"
                  onClick={handleSignup}
                  disabled={state.isButtonDisabled}
                >
                  Sign Up
                </Button>
              </CardActions>
            </Card>
          </form>
        </Paper>
      </Box>
    </Grid>
    </Box>
  );
};

export default Register;
