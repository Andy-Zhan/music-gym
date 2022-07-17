import {
  Button,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  ButtonGroup,
  Switch,
  Typography,
} from "@mui/material";
import React, { useState, useContext, useEffect } from "react";
import Soundfont from "soundfont-player";
import BackIcon from "@mui/icons-material/KeyboardBackspace";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { styled, useTheme } from "@mui/material/styles";
import { soundContext } from "./app";

const allNotes = [
  "C",
  "C♯/D♭",
  "D",
  "D♯/E♭",
  "E",
  "F",
  "F♯/G♭",
  "G",
  "G♯/A♭",
  "A",
  "A♯/B♭",
  "B",
];

const synthNotes = [...allNotes].reduce(
  (a, v, i) => ({
    ...a,
    [v]: ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"][i],
  }),
  {}
);

function RandomMelody({ setPage }) {
  const theme = useTheme();
  const [customNotes, setCustomNotes] = useState(
    [...allNotes].reduce((a, v) => ({ ...a, [v]: true }), {})
  );
  const [notes, setNotes] = useState([]);
  const [numberOfNotes, setNumberOfNotes] = useState(5);
  const [settings, setSettings] = useState({
    allowRepeated: true,
    allowDuplicate: true,
    customNotes: false,
  });
  const [instrument, setInstrument] = useState(null);

  const ac = useContext(soundContext);

  useEffect(() => {
    if (!settings.allowDuplicate) {
      setNumberOfNotes((n) =>
        Math.min(
          settings.customNotes
            ? Object.values(customNotes).filter(Boolean).length
            : allNotes.length,
          n
        )
      );
    }
  }, [settings.allowDuplicate, settings.customNotes, customNotes]);

  useEffect(() => {
    Soundfont.instrument(ac, "acoustic_grand_piano").then((piano) =>
      setInstrument(piano)
    );
  }, [ac]);

  const getNotesToPlay = (notes) => {
    let octave = 4;
    return notes.map((note, i) => {
      if (i > 0) octave = getOctave(notes[i - 1], note, octave);
      return synthNotes[note] + octave.toString();
    });
  };

  const play = () => {
    instrument?.stop();
    getNotesToPlay(notes).forEach((note, i) => {
      instrument?.play(note, ac.currentTime + i * 0.8, { duration: 1 });
    });
  };

  const playNote = (noteIndex) => {
    instrument?.stop();
    instrument?.play(getNotesToPlay(notes)[noteIndex]);
  };

  const getOctave = (prev, curr, prevOctave) => {
    const prevIndex = allNotes.indexOf(prev);
    const currIndex = allNotes.indexOf(curr);
    const dist = currIndex - prevIndex;
    const shift = dist >= 7 ? -1 : dist <= -7 ? 1 : 0;
    return prevOctave + shift;
  };

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
        const allowedNotes = (
          settings.customNotes
            ? Object.keys(customNotes).filter((i) => customNotes[i])
            : allNotes
        ).filter((i) => isNoteAllowed(i, selectedNotes));
        selectedNotes.push(
          allowedNotes[Math.floor(Math.random() * allowedNotes.length)]
        );
      });
    return selectedNotes;
  };

  const generate = () => {
    instrument?.stop();
    setNotes(getRandomNotes(numberOfNotes));
  };

  const handleChangeSettings = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.checked,
    });
  };

  const RemoveIconIncrementButton = styled(RemoveIcon)(({ theme }) => ({
    fontSize: "1rem",
    margin: 5,
  }));

  const AddIconIncrementButton = styled(AddIcon)(({ theme }) => ({
    fontSize: "1rem",
    margin: 5,
  }));

  return (
    <div>
      <IconButton onClick={() => setPage("home")}>
        <BackIcon />
      </IconButton>
      <Fade in={true} timeout={{ enter: 500, exit: 500 }}>
        <div
          style={{
            padding: "0px 0px 20px 0px",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div>
            <Typography
              variant="h4"
              style={{
                textAlign: "center",
                padding: 20,
              }}
            >
              Random Melody Generator
            </Typography>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="body1" style={{ fontSize: 20 }}>
                Number of notes to generate:
                <IconButton
                  size="small"
                  disabled={numberOfNotes === 1}
                  onClick={() => setNumberOfNotes((n) => Math.max(1, n - 1))}
                  style={{ margin: "0px 10px" }}
                >
                  <RemoveIconIncrementButton />
                </IconButton>
                {numberOfNotes}
                <IconButton
                  size="small"
                  style={{ margin: "0px 10px" }}
                  disabled={
                    numberOfNotes ===
                    (settings.allowDuplicate
                      ? 20
                      : settings.customNotes
                      ? Object.values(customNotes).filter(Boolean).length
                      : allNotes.length)
                  }
                  onClick={() =>
                    setNumberOfNotes((n) =>
                      Math.min(
                        settings.allowDuplicate
                          ? 20
                          : settings.customNotes
                          ? Object.values(customNotes).filter(Boolean).length
                          : allNotes.length,
                        n + 1
                      )
                    )
                  }
                >
                  <AddIconIncrementButton />
                </IconButton>
              </Typography>

              <div style={{ paddingTop: 20 }}>
                <Button
                  onClick={play}
                  variant="outlined"
                  disabled={notes.length === 0 || instrument === null}
                  style={{ marginRight: 20 }}
                >
                  {instrument === null ? "Loading..." : "Play melody"}
                </Button>
                <Button onClick={generate} variant="contained">
                  Generate
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  width: 720,
                }}
              >
                {notes.length <= 10 ? (
                  <ButtonGroup style={{ marginTop: 20 }}>
                    {notes.map((i, k) => (
                      <Button
                        key={k}
                        style={{ width: 60 }}
                        onClick={() => playNote(k)}
                      >
                        {i}
                      </Button>
                    ))}
                  </ButtonGroup>
                ) : (
                  <>
                    <ButtonGroup style={{ marginTop: 20 }}>
                      {notes.slice(0, notes.length / 2).map((i, k) => (
                        <Button
                          style={{ width: 60 }}
                          key={k}
                          onClick={() => playNote(k)}
                        >
                          {i}
                        </Button>
                      ))}
                    </ButtonGroup>
                    <ButtonGroup style={{ marginTop: 2 }}>
                      {notes.slice(notes.length / 2).map((i, k) => (
                        <Button
                          style={{ width: 60 }}
                          key={k}
                          onClick={() => playNote(k + notes.length / 2)}
                        >
                          {i}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: "90%",
              marginTop: 20,
              border: "1px solid " + theme.palette.primary.main + "40",
              borderRadius: 4,
              padding: 20,
            }}
          >
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
                  label="Allow repeated notes (e.g. C-C-C)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowDuplicate}
                      onChange={handleChangeSettings}
                      name="allowDuplicate"
                    />
                  }
                  label="Allow duplicate notes (e.g. C-D-C)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.customNotes}
                      onChange={handleChangeSettings}
                      name="customNotes"
                    />
                  }
                  label="Only use selected notes"
                />
              </FormGroup>
              <ButtonGroup style={{ margin: "10px 0" }}>
                {allNotes.map((v, k) => (
                  <Button
                    onClick={() => {
                      setCustomNotes((n) => ({ ...n, [v]: !n[v] }));
                    }}
                    style={{ width: 64 }}
                    key={k}
                    variant={customNotes[v] ? "contained" : "outlined"}
                    disabled={!settings.customNotes}
                  >
                    {v}
                  </Button>
                ))}
              </ButtonGroup>
            </FormControl>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export default RandomMelody;
