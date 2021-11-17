import React, { useReducer, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import { Paper } from '@mui/material';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';

const container = {
  display: "flex",
  flexWrap: "wrap",
  width: 400,
  margin: 0
};
const loginBtn = {
  marginTop: 2,
  flexGrow: 1
};
const signupBtn = {
  marginTop: 2,
  flexGrow: 1
};
const header = {
  textAlign: "center",
  background: "#212121",
  color: "#fff"
};
const card = {
  marginTop: 10
};

type State = {
  username: string;
  password: string;
  login: string; //todo: get error status from backend
  signup: string;
  isButtonDisabled: boolean;
  helperText: string;
  isError: boolean;
};

const initialState: State = {
  username: "",
  password: "",
  login: "",
  signup: "",
  isButtonDisabled: true,
  helperText: "",
  isError: false
};

type Action =
  | { type: "setUsername"; payload: string }
  | { type: "setPassword"; payload: string }
  | { type: "setIsButtonDisabled"; payload: boolean }
  | { type: "loginSuccess"; payload: string }
  | { type: "loginFailed"; payload: string }
  | { type: "setIsError"; payload: boolean }
  | { type: "signupSuccess"; payload: string }
  | { type: "signupFailed"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setUsername":
      return {
        ...state,
        username: action.payload
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
    case "loginSuccess":
      return {
        ...state,
        helperText: action.payload,
        isError: false
      };
    case "loginFailed":
      return {
        ...state,
        helperText: action.payload,
        isError: true
      };
    case "setIsError":
      return {
        ...state,
        isError: action.payload
      };
    case "signupSuccess":
      return {
        ...state,
        helperText: action.payload,
        isError: false
      };
    case "signupFailed":
      return {
        ...state,
        helperText: action.payload,
        isError: true
      };
  }
};

const Login = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [formValue, setformValue] = React.useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    if (state.username.trim() && state.password.trim()) {
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
  }, [state.username, state.password]);
  //----------------------------------------------------------------------------------------------
  const handleLogin = () => {
    //TODO: will adjust depending on feedback from backend
    if (state.username === "email" && state.password === "pw") {
      dispatch({
        type: "loginSuccess",
        payload: "Login Successfully"
      });
      console.log(" successfully logged in", state.username);
    } else {
      dispatch({
        type: "loginFailed",
        payload: "Incorrect username or password"
      });
    }
  };

  const handleSignup = () => {
    //TODO: will adjust depending on feedback from backend
    if (state.username !== "email") {
      dispatch({
        type: "signupSuccess",
        payload: "Signed Up Successfully"
      });
      console.log("username", state.username);
      console.log("password", state.password);
    } else {
      dispatch({
        type: "signupFailed",
        payload: "Username Unavailable" //change to specific issue
      });
    }
  };

  fetch("/user/auth", {
    method: "POST",
    body: JSON.stringify(setformValue)
  })
    .then((r) => r.json())
    .then((token) => {
      if (token.access_token) {
        console.log(token);
      } else {
        console.log("Please type in correct username/password");
      }
    });

  //-------------------------------------------------------------------------------------------
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 || event.which === 13) {
      state.isButtonDisabled || handleLogin();
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
    <Box sx={{ flexGrow: 1 }}>
      <Container>
        <Paper
        width="100"
        height="100"
        margin="100"
        elevation={3}
        >
          <form id="formSubmit" noValidate autoComplete="off">
            <Card>
              <CardHeader title="Login / Sign Up" />
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
                      className="loginBtn"
                      onClick={handleLogin}
                      disabled={state.isButtonDisabled}
                    >
                      Login
                    </Button>
          
                    <Button
                      variant="outlined"
                      size="large"
                      color="secondary"
                      className="signupBtn"
                      onClick={handleSignup}
                      disabled={state.isButtonDisabled}
                    >
                      Sign Up
                    </Button>
                  </CardActions>
                </Card>
              </form>
                </Paper>
                </Container>
                </Box>
    
  );
};

export default Login;
