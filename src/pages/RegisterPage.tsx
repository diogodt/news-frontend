import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  country: z.string().optional(),
  language: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "no", label: "Norwegian" },
  { code: "ru", label: "Russian" },
  { code: "sv", label: "Swedish" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "he", label: "Hebrew" },
];

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        country: data.country,
        language: data.language,
      });
      navigate("/onboarding");
    } catch (err) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(message || "Unable to register right now.");
    }
  };

  return (
    <Box className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card elevation={0} sx={{ maxWidth: 520, width: "100%", border: "1px solid #e5e7eb" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Create your account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start with your profile details so we can tailor your news feed.
              </Typography>
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="Full name"
                  fullWidth
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
                <TextField label="Country" fullWidth {...register("country")} />
                <TextField label="Language" select fullWidth {...register("language")} helperText="Content language preference">
                  <MenuItem value="">Select</MenuItem>
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                  Create account
                </Button>
              </Stack>
            </form>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
