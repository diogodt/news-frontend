import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

interface Props {
  initialValue?: string;
  initialFrom?: string;
  initialTo?: string;
  onSearch: (value: string, from?: string, to?: string) => void;
  loading?: boolean;
  suggestions?: string[];
}

export const SearchBar = ({ initialValue = "", initialFrom, initialTo, onSearch, loading, suggestions = [] }: Props) => {
  const [value, setValue] = useState(initialValue);
  const [fromDate, setFromDate] = useState<Dayjs | null>(initialFrom ? dayjs(initialFrom) : null);
  const [toDate, setToDate] = useState<Dayjs | null>(initialTo ? dayjs(initialTo) : null);
  const [tempFrom, setTempFrom] = useState<Dayjs | null>(null);
  const [tempTo, setTempTo] = useState<Dayjs | null>(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    if (initialFrom !== undefined) {
      setFromDate(initialFrom ? dayjs(initialFrom) : null);
    }
    if (initialTo !== undefined) {
      setToDate(initialTo ? dayjs(initialTo) : null);
    }
  }, [initialValue, initialFrom, initialTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length < 2) return;
    const fromStr = fromDate ? fromDate.format("YYYY-MM-DD") : undefined;
    const toStr = toDate ? toDate.format("YYYY-MM-DD") : undefined;
    onSearch(value.trim(), fromStr, toStr);
  };

  const handleRangeChange = (day: Dayjs | null) => {
    if (!day) return;
    if ((tempFrom && day.isSame(tempFrom, "day")) || (tempTo && day.isSame(tempTo, "day"))) {
      setTempFrom(null);
      setTempTo(null);
      return;
    }
    if (tempFrom && tempTo) {
      setTempFrom(day);
      setTempTo(null);
      return;
    }
    if (tempFrom && !tempTo) {
      if (day.isBefore(tempFrom, "day")) {
        setTempTo(tempFrom);
        setTempFrom(day);
      } else {
        setTempTo(day);
      }
      return;
    }
    setTempFrom(day);
  };

  const confirmRange = () => {
    setFromDate(tempFrom);
    setToDate(tempTo);
    setDateDialogOpen(false);
  };

  const cancelRange = () => {
    setTempFrom(fromDate);
    setTempTo(toDate);
    setDateDialogOpen(false);
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": { height: 52, borderRadius: "6px !important" },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": { borderRadius: "6px !important" },
    "& .MuiOutlinedInput-input": { height: "100%", boxSizing: "border-box", padding: "16.5px 14px" },
  };
  const buttonSx = {
    height: 52,
    minWidth: 64,
    borderRadius: "6px !important",
    px: 3.5,
    color: "#365563",
    boxShadow: "none",
    "&:hover": { boxShadow: "none" },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={0}
        sx={{
          px: 0,
          py: "18px",
          borderRadius: 0,
          border: "none",
          bgcolor: "transparent",
          boxShadow: "none",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Autocomplete
              freeSolo
              options={suggestions}
              inputValue={value}
              onInputChange={(_, newValue) => setValue(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Search topics (e.g. AI, crypto, climate)" fullWidth sx={inputSx} />
              )}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Date / range"
              size="medium"
              value={
                fromDate && toDate
                  ? `${fromDate.format("MM/DD/YYYY")} - ${toDate.format("MM/DD/YYYY")}`
                  : fromDate
                  ? fromDate.format("MM/DD/YYYY")
                  : ""
              }
              placeholder="Select date or range"
              InputProps={{ readOnly: true }}
              onClick={() => {
                setTempFrom(fromDate);
                setTempTo(toDate);
                setDateDialogOpen(true);
              }}
              sx={{ minWidth: 220, ...inputSx }}
            />
            <Button type="submit" variant="contained" disabled={loading} sx={buttonSx}>
              <SearchIcon sx={{ fontSize: "40px", marginLeft: "-15px", marginRight: "-15px", color: "#365563" }} />
            </Button>
          </Stack>
        </form>
      </Paper>

      <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select date or range</DialogTitle>
        <DialogContent>
          <DateCalendar
            value={tempTo || tempFrom}
            onChange={handleRangeChange}
            slots={{
              day: (props) => {
                const { day, outsideCurrentMonth, ...other } = props;
                const start = tempFrom;
                const end = tempTo;
                const isStart = !!start && day.isSame(start, "day");
                const isEnd = !!end && day.isSame(end, "day");
                const inRange = start && end && day.isAfter(start, "day") && day.isBefore(end, "day");
                const selected = isStart || isEnd;
                return (
                  <PickersDay
                    {...other}
                    day={day}
                    outsideCurrentMonth={outsideCurrentMonth}
                    selected={selected}
                    sx={{
                      ...(selected && {
                        bgcolor: "primary.main",
                        color: "#fff",
                        "&:hover": { bgcolor: "primary.dark" },
                      }),
                      ...(inRange && {
                        bgcolor: "primary.light",
                        opacity: 0.6,
                      }),
                    }}
                  />
                );
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRange}>Cancel</Button>
          <Button variant="contained" onClick={confirmRange}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
