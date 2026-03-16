import {
  Button,
  Collapse,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Switch,
  Typography,
  ButtonGroup,
} from "@mui/material";
import React, { useState, useContext, useEffect } from "react";
import Soundfont from "soundfont-player";
import BackIcon from "@mui/icons-material/KeyboardBackspace";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled, useTheme } from "@mui/material/styles";
import { soundContext } from "./app";

const allNotes = [
  "C",
  "C♯",
  "D",
  "E♭",
  "E",
  "F",
  "F♯",
  "G",
  "A♭",
  "A",
  "B♭",
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
  const [showOptions, setShowOptions] = useState(false);
  const [numberOfNotes, setNumberOfNotes] = useState(4);
  const [settings, setSettings] = useState({
    allowRepeated: true,
    allowDuplicate: true,
    customNotes: false,
  });
  const [instrument, setInstrument] = useState(null);


  const [slotStrips, setSlotStrips] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const clear = () => {
    instrument?.stop();
    setNotes([]);
    setSlotStrips([]);
    setIsSpinning(false);
  };

  const generate = () => {
    if (isGenerating) return;

    instrument?.stop();
    setIsGenerating(true);
    setIsSpinning(false);
    setNotes([]);

    const currentNotesList = settings.customNotes
      ? Object.keys(customNotes).filter((i) => customNotes[i])
      : allNotes;

    const finalGeneratedNotes = getRandomNotes(numberOfNotes);



    const newStrips = finalGeneratedNotes.map((finalNote, index) => {
      const spinLength = 15 + index * 10;
      const strip = Array(spinLength)
        .fill()
        .map(
          () =>
            currentNotesList[
            Math.floor(Math.random() * currentNotesList.length)
            ]
        );
      strip.push(finalNote);
      return strip;
    });

    setSlotStrips(newStrips);



    setTimeout(() => {
      setIsSpinning(true);


      const maxDurationMs = 2000 + (numberOfNotes - 1) * 500;


      setTimeout(() => {
        setNotes(finalGeneratedNotes);
        setIsGenerating(false);
      }, maxDurationMs);
    }, 50);
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
      <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, width: '100%' }}>
        <IconButton onClick={() => setPage("home")}>
          <BackIcon />
        </IconButton>
      </div>
      <Fade in={true} timeout={{ enter: 500, exit: 500 }}>
        <div
          style={{
            padding: "0px 0px 20px 0px",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ paddingTop: 20 }}>
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
                  disabled={numberOfNotes === 1 || isGenerating}
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
                    isGenerating ||
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
                  disabled={notes.length === 0 || instrument === null || isGenerating}
                  style={{ marginRight: 20 }}
                >
                  {instrument === null ? "Loading..." : "Play melody"}
                </Button>
                <Button
                  onClick={clear}
                  variant="outlined"
                  color="error"
                  disabled={isGenerating || (notes.length === 0 && slotStrips.length === 0)}
                  style={{ marginRight: 20 }}
                >
                  Clear
                </Button>
                <Button
                  onClick={generate}
                  variant="contained"
                  disabled={isGenerating}
                >
                  Generate
                </Button>
              </div>

              {/* Slot Machine Display Area */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "15px",
                  justifyContent: "center",
                  marginTop: "100px",
                  width: "100%",
                  padding: "0 10px",
                  boxSizing: "border-box"
                }}
              >
                {Array(numberOfNotes)
                  .fill()
                  .map((_, index) => {
                    const strip = slotStrips[index] || ["?"];
                    const isFinished = notes.length > 0;


                    const durationMs = 2000 + index * 500;

                    return (
                      <div
                        key={index}
                        style={{
                          width: "140px",
                          height: "140px",


                          overflow: "hidden",
                          position: "relative",
                          background: "white",
                          cursor: isFinished ? "pointer" : "default",
                          transition: "background 0.3s ease",

                        }}
                        onClick={() => {
                          if (isFinished) playNote(index);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",

                            transition: isSpinning
                              ? `transform ${durationMs}ms cubic-bezier(0.15, 0.85, 0.35, 1)`
                              : "none",

                            transform: isSpinning && strip.length > 1
                              ? `translateY(-${(strip.length - 1) * 120}px)`
                              : "translateY(0px)",
                          }}
                        >
                          {strip.map((note, noteIndex) => (
                            <div
                              key={noteIndex}
                              style={{
                                height: "120px",
                                flexShrink: 0,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="h1"
                                style={{
                                  color: "black",
                                  fontWeight: "bold",
                                }}
                              >
                                {note}
                              </Typography>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          {/* Options Toggle Button */}
          <div style={{ marginTop: 100, textAlign: 'center' }}>
            <Button
              variant="text"
              color="info"
              startIcon={<ExpandMoreIcon style={{
                transform: showOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.3s'
              }} />}
              onClick={() => setShowOptions(!showOptions)}
              disabled={isGenerating}
            >
              {showOptions ? "Hide Options" : "Show Options"}
            </Button>
          </div>

          {/* Collapsible Options Section */}
          <Collapse in={showOptions} style={{ width: '100%' }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "90%",
                maxWidth: "1200px",
                margin: "20px auto",
                border: "1px solid " + theme.palette.primary.main + "40",
                borderRadius: 8,
                padding: "30px",
                background: "rgba(255, 255, 255, 0.7)",
                boxShadow: "0px 4px 20px rgba(0,0,0,0.05)"
              }}
            >
              <FormControl component="fieldset" variant="standard" style={{ width: '100%' }}>
                <FormLabel component="legend" style={{ marginBottom: 10, fontWeight: 'bold' }}>
                  Generation Settings
                </FormLabel>

                <FormGroup row style={{ marginBottom: 20 }}> {/* Added 'row' to spread switches out */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!(!settings.allowDuplicate || !settings.allowRepeated)}
                        onChange={handleChangeSettings}
                        disabled={!settings.allowDuplicate || isGenerating}
                        name="allowRepeated"
                      />
                    }
                    label="Allow repeated (C-C-C)"
                    style={{ marginRight: 30 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowDuplicate}
                        onChange={handleChangeSettings}
                        disabled={isGenerating}
                        name="allowDuplicate"
                      />
                    }
                    label="Allow duplicates (C-D-C)"
                    style={{ marginRight: 30 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customNotes}
                        onChange={handleChangeSettings}
                        disabled={isGenerating}
                        name="customNotes"
                      />
                    }
                    label="Filter by selected notes"
                  />
                </FormGroup>

                <div style={{ marginTop: 10 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Select Notes to Include:
                  </Typography>
                  <ButtonGroup
                    variant="outlined"
                    aria-label="note selection"
                    fullWidth
                    style={{
                      marginTop: 10,
                      overflowX: 'auto'
                    }}
                  >
                    {allNotes.map((v, k) => (
                      <Button
                        onClick={() => {
                          setCustomNotes((n) => ({ ...n, [v]: !n[v] }));
                        }}
                        key={k}
                        variant={customNotes[v] ? "contained" : "outlined"}
                        disabled={!settings.customNotes || isGenerating}
                        style={{
                          flex: 1,
                          minWidth: '50px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {v}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
              </FormControl>
            </div>
          </Collapse>
        </div>
      </Fade>
    </div>
  );
}

export default RandomMelody;