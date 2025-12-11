import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

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

const schema = z.object({
  name: z.string().min(2),
  country: z.string().optional(),
  languages: z.array(z.string()).optional(),
  newsApiToken: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      country: user?.country || "",
      languages: user?.languages || [],
      newsApiToken: user?.newsApiToken || "",
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || "",
      country: user?.country || "",
      languages: user?.languages || [],
      newsApiToken: user?.newsApiToken || "",
    });
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);
    try {
      await updateUser({
        name: data.name,
        country: data.country,
        languages: data.languages,
        newsApiToken: data.newsApiToken || undefined,
      });
      setSuccess("Profile updated.");
    } catch (err) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(message || "Could not update profile.");
    }
  };

  return (
    <Box className="min-h-[60vh]">
      <Card elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Update your personal info, preferred languages, and NewsAPI key for searches.
              </Typography>
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="Full name"
                  fullWidth
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
                <TextField label="Country" fullWidth {...register("country")} />
                <Controller
                  control={control}
                  name="languages"
              render={({ field }) => (
                <Autocomplete
                      multiple
                      options={languages.map((l) => l.code)}
                      value={field.value || []}
                      onChange={(_, value) => field.onChange(value)}
                      getOptionLabel={(option) => languages.find((l) => l.code === option)?.label || option}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="filled"
                            color="primary"
                            label={languages.find((l) => l.code === option)?.label || option}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Languages"
                          helperText={errors.languages?.message || "Select one or more languages. If none selected, articles in all languages will be shown."}
                          error={!!errors.languages}
                        />
                      )}
                    />
                  )}
                />
                <TextField
                  label="NewsAPI key"
                  fullWidth
                  placeholder="Paste your NewsAPI.org token"
                  {...register("newsApiToken")}
                  helperText="Enter your NewsAPI Key. Required for searches."
                  required
                  defaultValue={user?.newsApiToken || ""}
                />
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                  Save changes
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
