import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography, GlobalStyles } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { requestPasswordReset } from "../api/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [requestingReset, setRequestingReset] = useState(false);
  const inputClass = "login-input";
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate("/app/search");
    } catch (err) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(message || "Unable to log in. Check your credentials.");
    }
  };

  const handleResetRequest = async () => {
    const email = getValues("email");
    if (!email) return;
    setRequestingReset(true);
    try {
      const token = await requestPasswordReset(email);
      setResetToken(token || "Check backend logs for the reset token.");
    } finally {
      setRequestingReset(false);
    }
  };

  return (
    <Box
      className="min-h-screen flex items-center justify-center px-4"
      sx={{
        backgroundImage: "url('/bg-login.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#514c4c",
        backgroundBlendMode: "overlay",
      }}
    >
      <GlobalStyles
        styles={{
          [`.${inputClass} .MuiOutlinedInput-root`]: {
            height: 52,
            borderRadius: "15px !important",
          },
          [`.${inputClass} .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline`]: {
            borderRadius: "15px !important",
          },
          [`.${inputClass} .MuiOutlinedInput-input`]: {
            padding: "16.5px 14px !important",
            height: "100%",
            boxSizing: "border-box",
          },
        }}
      />
      <Card elevation={0} sx={{ maxWidth: 460, width: "100%", border: "1px solid #e5e7eb", backdropFilter: "blur(4px)" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to explore tailored news and manage your collections.
              </Typography>
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  {...registerField("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                  className={inputClass}
                />
                <TextField
                  label="Password"
                  type="password"
                  {...registerField("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  fullWidth
                  className={inputClass}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ "&:hover": { backgroundColor: "rgb(49, 103, 125)", color: "#fff" } }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                New here?{" "}
                <Link to="/register" className="text-blue-600">
                  Create an account
                </Link>
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={handleResetRequest}
                disabled={requestingReset}
                sx={{ color: "#fff", "&:hover": { color: "#fff" } }}
              >
                Dev reset token
              </Button>
              
            </Stack>
            {resetToken && (
              <Alert severity="info">
                Dev-only reset token: <strong>{resetToken}</strong>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
