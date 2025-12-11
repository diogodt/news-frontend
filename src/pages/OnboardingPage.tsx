import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Autocomplete, Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  newsApiToken: z.string().min(10, "Token is required"),
  favoriteTopics: z.array(z.string()).min(1, "Add at least one topic"),
  country: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const presetTopics = ["AI", "Crypto", "Climate", "Space", "Fintech", "Health", "Gaming", "Sports"];
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

export const OnboardingPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      favoriteTopics: user?.favoriteTopics || [],
      country: user?.country || "",
      languages: user?.languages || [],
    },
  });

  useEffect(() => {
    if (user?.favoriteTopics) setValue("favoriteTopics", user.favoriteTopics);
    if (user?.country) setValue("country", user.country);
    if (user?.languages?.length) setValue("languages", user.languages);
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await updateUser({
        newsApiToken: data.newsApiToken,
        favoriteTopics: data.favoriteTopics,
        country: data.country,
        languages: data.languages,
      });
      navigate("/app/search");
    } catch (err) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(message || "Could not save onboarding details.");
    }
  };

  return (
    <Box className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card elevation={0} sx={{ maxWidth: 720, width: "100%", border: "1px solid #e5e7eb" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Finish setting up
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add your NewsAPI token and favorite topics to personalize your feed and sync across devices.
              </Typography>
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="NewsAPI token"
                  placeholder="Paste your NewsAPI.org token"
                  {...register("newsApiToken")}
                  error={!!errors.newsApiToken}
                  helperText={errors.newsApiToken?.message}
                />
                <Controller
                  name="favoriteTopics"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={presetTopics}
                      value={field.value}
                      onChange={(_, value) => field.onChange(value)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => <Chip variant="filled" color="primary" label={option} {...getTagProps({ index })} />)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Favorite topics"
                          error={!!errors.favoriteTopics}
                          helperText={errors.favoriteTopics?.message || "Press enter to add a topic"}
                        />
                      )}
                    />
                  )}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="Country" fullWidth {...register("country")} />
                  <Controller
                    name="languages"
                    control={control}
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
                        renderInput={(params) => <TextField {...params} label="Languages" placeholder="Select languages" />}
                      />
                    )}
                  />
                </Stack>
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                  Save & Continue
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
