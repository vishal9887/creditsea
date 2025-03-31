import { styled } from "@mui/material";
import { CameraAlt as CameraAltIcon } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Box,
} from "@mui/material";
import axios from "axios";
import { useState, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { server } from "../components/server";
import "./Login.css";
import { useNavigate } from "react-router-dom";

const VisuallyHiddenInput = styled("input")({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

// Custom hooks to replace the 6pp dependency
const useInputValidation = (initialValue: string) => {
  const [value, setValue] = useState<string>(initialValue);
  const [error, setError] = useState<string>("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Basic validation for email
    if (
      e.target.type === "email" ||
      e.target.name === "email" ||
      e.target.id === "email"
    ) {
      if (newValue && !validateEmail(newValue)) {
        setError("Please enter a valid email address");
      } else {
        setError("");
      }
    }
  };

  // Added for direct setting of value
  const setValue2 = (newValue: string) => {
    setValue(newValue);
    if (newValue.includes("@")) {
      if (!validateEmail(newValue)) {
        setError("Please enter a valid email address");
      } else {
        setError("");
      }
    }
  };

  return { value, error, changeHandler, setValue: setValue2 };
};

const useFileHandler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setError("Please select a file");
      return;
    }

    const MAX_SIZE = 1024 * 1024; // 1MB
    const selectedFile = files[0];

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      setError("File size should be less than 1MB");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
  };

  return { file, preview, error, changeHandler };
};


// User role types
type UserRole = "user" | "admin" | "verifier" | null;

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const navigate = useNavigate();
  const toggleLogin = () => setIsLogin((prev) => !prev);

  const name = useInputValidation("");
  const email = useInputValidation("");
  const password = useInputValidation("");
  const avatar = useFileHandler("single");
  // Handle role selection
  const handleRoleSelection = (role: UserRole) => {
    if (role === selectedRole) {
      // If clicking the same role, deselect it
      setSelectedRole(null);
      email.setValue("");
      password.setValue("");
    } else {
      setSelectedRole(role);
      // Set testing credentials based on role
      if (role === "user") {
        email.setValue("user@gmail.com");
      } else if (role === "admin") {
        email.setValue("admin@gmail.com");
      } else if (role === "verifier") {
        email.setValue("verifier@gmail.com");
      }

      // Set default password for testing
      password.setValue("1234");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Logging In...");
    setIsLoading(true);
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const { data } = await axios.post(
        `${server}/user/signin`,
        {
          email: email.value,
          password: password.value,
        },
        config
      );

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem("creditseaid", data.token);
      }
      toast.success(data.message, {
        id: toastId,
      });
      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else if (data.user.role === "VERIFIER") {
        navigate("/verifier");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something Went Wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading("Signing Up...");
    setIsLoading(true);

    const formData = new FormData();
    if (avatar.file) {
      formData.append("avatar", avatar.file);
    }
    formData.append("name", name.value);
    formData.append("email", email.value);
    formData.append("password", password.value);

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    try {
      const { data } = await axios.post(
        `${server}/user/signup`,
        formData,
        config
      );

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem("creditseaid", data.token);
      }

      toast.success(data.message, {
        id: toastId,
      });
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something Went Wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
        }}
      ></div>
      <div>
        <Stack direction={"row"} alignItems={"center"}>
          <Typography className="a1" style={{ zIndex: 10 }}>
            Creditsea
          </Typography>
        </Stack>
        <Container
          component={"main"}
          maxWidth="xs"
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            className="a2"
          >
            {isLogin ? (
              <>
                <Typography variant="h5">Login</Typography>

                {/* Test login options */}
                <Box mt={2} mb={1} width="100%">
                  <FormLabel component="legend">Test Login Options:</FormLabel>
                  <FormGroup>
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="space-between"
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedRole === "user"}
                            onChange={() => handleRoleSelection("user")}
                          />
                        }
                        label="User"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedRole === "admin"}
                            onChange={() => handleRoleSelection("admin")}
                          />
                        }
                        label="Admin"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedRole === "verifier"}
                            onChange={() => handleRoleSelection("verifier")}
                          />
                        }
                        label="Verifier"
                      />
                    </Stack>
                  </FormGroup>
                </Box>

                <form
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                  }}
                  onSubmit={handleLogin}
                >
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    margin="normal"
                    variant="outlined"
                    value={email.value}
                    onChange={email.changeHandler}
                  />

                  <TextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    variant="outlined"
                    value={password.value}
                    onChange={password.changeHandler}
                  />

                  <Button
                    sx={{
                      marginTop: "1rem",
                    }}
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                  >
                    Login
                  </Button>

                  <Typography textAlign={"center"} m={"1rem"}>
                    OR
                  </Typography>

                  <Button
                    disabled={isLoading}
                    fullWidth
                    variant="text"
                    onClick={toggleLogin}
                  >
                    Sign Up Instead
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Typography variant="h5">Sign Up</Typography>
                <form
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                  }}
                  onSubmit={handleSignUp}
                >
                  <Stack position={"relative"} width={"10rem"} margin={"auto"}>
                    <Avatar
                      sx={{
                        width: "10rem",
                        height: "10rem",
                        objectFit: "contain",
                      }}
                      src={avatar.preview}
                    />

                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        color: "white",
                        bgcolor: "rgba(0,0,0,0.5)",
                        ":hover": {
                          bgcolor: "rgba(0,0,0,0.7)",
                        },
                      }}
                      component="label"
                    >
                      <>
                        <CameraAltIcon />
                        <VisuallyHiddenInput
                          type="file"
                          onChange={avatar.changeHandler}
                        />
                      </>
                    </IconButton>
                  </Stack>

                  {avatar.error && (
                    <Typography
                      m={"1rem auto"}
                      width={"fit-content"}
                      display={"block"}
                      color="error"
                      variant="caption"
                    >
                      {avatar.error}
                    </Typography>
                  )}

                  <TextField
                    required
                    fullWidth
                    label="Name"
                    margin="normal"
                    variant="outlined"
                    value={name.value}
                    onChange={name.changeHandler}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    margin="normal"
                    variant="outlined"
                    value={email.value}
                    onChange={email.changeHandler}
                  />

                  {email.error && (
                    <Typography color="error" variant="caption">
                      {email.error}
                    </Typography>
                  )}

                  <TextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    variant="outlined"
                    value={password.value}
                    onChange={password.changeHandler}
                  />
                  <Button
                    sx={{
                      marginTop: "1rem",
                    }}
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                  >
                    Sign Up
                  </Button>

                  <Typography textAlign={"center"} m={"1rem"}>
                    OR
                  </Typography>

                  <Button
                    disabled={isLoading}
                    fullWidth
                    variant="text"
                    onClick={toggleLogin}
                  >
                    Login Instead
                  </Button>
                </form>
              </>
            )}
          </Paper>
        </Container>
      </div>
    </>
  );
};

export default Login;
