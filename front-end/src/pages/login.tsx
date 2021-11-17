import React, { useReducer, useEffect } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

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
  isButtonDisabled: boolean;
  helperText: string;
  isError: boolean;
};

const initialState: State = {
  username: "",
  password: "",
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
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);
  const loginFormData = new FormData();
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

  const handleLogin = () => {
    if (state.username === "user" && state.password === "password") {
      dispatch({
        type: "loginSuccess",
        payload: "Login Successfully"
      });
    } else {
      dispatch({
        type: "loginFailed",
        payload: "Incorrect username or password"
      });
    }
  };

  const handleSignup = () => {
    if (state.username !== "user") {
      dispatch({
        type: "signupSuccess",
        payload: "Signed Up Successfully"
      });
      loginFormData.append("username", state.username);
      console.log("username", state.username);
      loginFormData.append("password", state.password);
      console.log("username", state.password);
    } else {
      dispatch({
        type: "signupFailed",
        payload: "Username Unavailable"
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 || event.which === 13) {
      state.isButtonDisabled || handleLogin() || handleSignup();
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
  const onSubmitHandle = () => {
    if (classes.loginBtn) {
      type: {
        handleLogin;
      }
    } else if (classes.signupBtn) {
      type: {
        handleSignup;
      }
    }
  };

  return (
    <form onSubmit={onSubmitHandle} noValidate autoComplete="off">
      <Card className={classes.card}>
        <CardHeader className={classes.header} title="Login / Sign Up" />
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
            className={classes.loginBtn}
            onClick={handleLogin}
            disabled={state.isButtonDisabled}
          >
            Login
          </Button>

          <Button
            variant="outlined"
            size="large"
            color="secondary"
            className={classes.signupBtn}
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

export default Login;
