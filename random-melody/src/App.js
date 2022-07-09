import { useState } from "react";
import "./App.css";
import {
  TextField,
  Paper,
  Button,
  Switch,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
} from "@mui/material";

function App() {
  const allNotes = [
    "A",
    "Bb",
    "B",
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
  ];
  const [notes, setNotes] = useState([]);
  const [numberOfNotes, setNumberOfNotes] = useState(5);
  const [settings, setSettings] = useState({
    allowRepeated: true,
    allowDuplicate: true,
  });

  const isNoteAllowed = (note, selectedNotes) => {
    if (!settings.allowDuplicate && selectedNotes.includes(note)) {
      return false;
    }
    if (
      !settings.allowRepeated &&
      selectedNotes[selectedNotes.length - 1] === note
    ) {
      return false;
    }
    return true;
  };

  const getRandomNotes = (n) => {
    let selectedNotes = [];
    Array(n)
      .fill()
      .forEach(() => {
        const allowedNotes = allNotes.filter((i) =>
          isNoteAllowed(i, selectedNotes)
        );
        selectedNotes.push(
          allowedNotes[Math.floor(Math.random() * allowedNotes.length)]
        );
      });
    return selectedNotes;
  };

  const generate = () => {
    setNotes(getRandomNotes(numberOfNotes));
  };

  const handleChangeSettings = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.checked,
    });
  };

  return (
    <div className="App">
      <Paper>
        Number of notes to generate:
        <TextField
          value={numberOfNotes}
          onChange={(e) => setNumberOfNotes(e.target.value)}
        ></TextField>
        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Options</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    !(!settings.allowDuplicate || !settings.allowRepeated)
                  }
                  onChange={handleChangeSettings}
                  disabled={!settings.allowDuplicate}
                  name="allowRepeated"
                />
              }
              label="Allow repeated notes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowDuplicate}
                  onChange={handleChangeSettings}
                  name="allowDuplicate"
                />
              }
              label="Allow duplicate notes"
            />
          </FormGroup>
        </FormControl>
        <Button onClick={generate}>Generate</Button>
        <div>{notes.join(", ")}</div>
      </Paper>
    </div>
  );
}

export default App;
