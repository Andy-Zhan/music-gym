import AddIcon from "@mui/icons-material/Add";
import BackIcon from "@mui/icons-material/KeyboardBackspace";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Button,
  ButtonGroup,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Soundfont from "soundfont-player";
import { soundContext } from "./app";

const pitches = [
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
const synthPitches = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const ButtonActionButton = styled(Button)(() => ({
  margin: 10,
}));

const DivKeys = styled("div")(() => ({
  padding: 10,
}));

const StartButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  margin: 10,
}));

const RemoveIconIncrementButton = styled(RemoveIcon)(({ theme }) => ({
  fontSize: "1rem",
  margin: 5,
}));

const AddIconIncrementButton = styled(AddIcon)(({ theme }) => ({
  fontSize: "1rem",
  margin: 5,
}));

const loseLife = keyframes`
    0% {
      opacity: 0;
      font-size: 30px;
    }
    100% {
      opacity: 1;
      font-size: 1rem;
    },
  `;

const encouragementAnim = keyframes`
0% {
      opacity: 0;
    },
    50% {
      opacity: 1;
    },
    100% {
      opacity: 0;
    },
`;

const LifeText = styled("span")((props) => ({
  animation: props.livesAnimation
    ? `${loseLife} 1000ms ${props.theme.transitions.easing.easeInOut}`
    : undefined,
}));

const EncouragementText = styled(Typography)((props) => ({
  animation: props.encouragementAnimation
    ? `${encouragementAnim} 1000ms ${props.theme.transitions.easing.easeInOut}`
    : undefined,
  opacity: props.encouragementAnimation ? undefined : 0,
}));

const encouragements = ["Not quite!", "Try again!"];

const Pitch = ({ setPage, isSurvival }) => {
  const theme = useTheme();
  const ac = useContext(soundContext);
  const blackKeys = [1, 3, 6, 8, 10];
  const [pitchSelect, setPitchSelect] = useState(
    new Array(pitches.length).fill(false)
  );
  const [pitchCorrect, setPitchCorrect] = useState(
    new Array(pitches.length).fill(false)
  );
  const [pitchPlay, setPitchPlay] = useState([]);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [livesAnimation, setLivesAnimation] = useState(false);
  const [encouragementAnimation, setEncouragementAnimation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrect, setIncorrect] = useState(false);
  const [noteCount, setNoteCount] = useState(1);
  const [lastChord, setLastChord] = useState([]);
  const [isShowAnswer, setShowAnswer] = useState(false);
  const [encouragementText, setEncouragementText] = useState(0);
  const [hasStarted, setStarted] = useState(false);
  const [range, setRange] = useState({
    low: 2,
    high: 5,
  });

  const [settings, setSettings] = useState({
    customNotes: false,
    allowSameNote: false,
  });

  const [refPitch, setRefPitch] = useState(0);

  const [customNotes, setCustomNotes] = useState(
    new Array(pitches.length).fill(true)
    //[...pitches].reduce((a, v) => ({ ...a, [v]: true }), {})
  );

  const [instrument, setInstrument] = useState(null);

  const restart = () => {
    clearSelect();
    setCorrectCount(0);
    setIncorrectCount(0);
    setNoteCount(1);
    setLastChord([]);
    setLivesAnimation(false);
    newChord();
  };

  const lives = () => {
    return Math.max(3 - incorrectCount, 0);
  };

  useEffect(() => {
    Soundfont.instrument(ac, "acoustic_grand_piano").then((piano) =>
      setInstrument(piano)
    );
  }, [ac]);

  const clearSelect = () => {
    setPitchSelect(new Array(pitches.length).fill(false));
  };

  const randint = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };

  const togglePitch = (pos) => {
    setPitchSelect((p) => p.map((v, i) => (i === pos ? !v : v)));
  };

  const getRange = (lo, hi) =>
    Array(hi - lo)
      .fill(0)
      .map((_, k) => k + lo);

  const getPossibleNotes = () =>
    getRange(range.low, range.high)
      .map((i) =>
        (settings.customNotes
          ? getRange(0, pitches.length).filter((_, i) => customNotes[i])
          : getRange(0, pitches.length)
        ).map((j) => [j, i])
      )
      .flat();

  const newChord = () => {
    let keys = new Array(pitches.length).fill(false);
    let toPlay = [];

    let possibleNotes = getPossibleNotes();

    for (let i = 0; i < noteCount; i++) {
      const rand = randint(0, possibleNotes.length);
      console.log(rand);
      const [noteIndex, octave] = possibleNotes[rand];
      keys[noteIndex] = true;
      toPlay.push(synthPitches[noteIndex] + octave);
      if (settings.allowSameNote) {
        possibleNotes.splice(rand, 1);
      } else {
        possibleNotes = possibleNotes.filter((i) => i !== noteIndex);
      }
    }
    setPitchCorrect(keys);
    setPitchPlay(toPlay);
  };

  const play = useCallback(() => {
    instrument?.stop();
    pitchPlay.forEach((note) => instrument?.play(note));
  }, [instrument, pitchPlay]);

  // const newChord = () => {
  //   let toPlay = [];
  //   let keys = new Array(pitches.length).fill(false);
  //   let note;
  //   let key;
  //   const times = (x) => (f) => {
  //     if (x > 0) {
  //       f();
  //       times(x - 1)(f);
  //     }
  //   };

  //   times(noteCount)(() => {
  //     do {
  //       key = randint(0, 11);
  //       note = synthPitches[key].concat(randint(2, 5).toString());
  //     } while (toPlay.includes(note));
  //     toPlay.push(note);
  //     keys[key] = true;
  //   });

  //   setPitchCorrect(keys);
  //   setPitchPlay(toPlay);
  // };

  // const getRandomNotes = (n) => {
  //   let selectedNotes = [];
  //   Array(n)
  //     .fill()
  //     .forEach(() => {
  //       const allowedNotes = (
  //         settings.customNotes
  //           ? Object.keys(customNotes).filter((i) => customNotes[i])
  //           : pitches
  //       ).filter((i) => isNoteAllowed(i, selectedNotes));
  //       selectedNotes.push(
  //         allowedNotes[Math.floor(Math.random() * allowedNotes.length)]
  //       );
  //     });
  //   return selectedNotes;
  // };

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

  useEffect(() => {
    if (instrument) play();
  }, [play, instrument]);

  const updateLastChord = () => {
    setLastChord(
      pitchPlay
        .sort(
          (a, b) =>
            parseInt(a.slice(-1)) - parseInt(b.slice(-1)) ||
            synthPitches.indexOf(a.slice(0, -1)) -
              synthPitches.indexOf(b.slice(0, -1))
        )
        .map((note) =>
          pitches[synthPitches.indexOf(note.slice(0, -1))].concat(
            note.slice(-1)
          )
        )
    );
  };

  const check = () => {
    if (pitchSelect.every((value, index) => value === pitchCorrect[index])) {
      setIncorrect(false);
      setCorrectCount((c) => c + 1);
      clearSelect();
      updateLastChord();
      if (isSurvival) {
        if ((correctCount - 1) % 5 === 2) setNoteCount((c) => c + 1);
        else newChord();
      } else {
        setShowAnswer(true);
      }
    } else {
      if (isSurvival) {
        if (lives() === 1) {
          setIncorrect(true);
          updateLastChord();
        }
        clearSelect();
        setIncorrectCount((c) => c + 1);
        setLivesAnimation(true);
        setTimeout(() => setLivesAnimation(false), 1000);
      } else if (!isSurvival) {
        if (!incorrect) setIncorrectCount((c) => c + 1);
        setIncorrect(true);
        setEncouragementText((v) => (v + 1) % encouragements.length);
        setEncouragementAnimation(true);
        setTimeout(() => setEncouragementAnimation(false), 1000);
        clearSelect();
      }
    }
  };

  const showAnswer = () => {
    if (!incorrect) setIncorrectCount((c) => c + 1);
    setIncorrect(true);

    updateLastChord();
    setShowAnswer(true);
  };

  const nextAfterShowAnswer = () => {
    clearSelect();

    setLastChord([]);
    newChord();
    setIncorrect(false);
    setShowAnswer(false);
  };

  const handleChangeSettings = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.checked,
    });
  };

  return (
    <>
      <IconButton onClick={() => setPage("home")}>
        <BackIcon />
      </IconButton>
      <Fade in={true} timeout={{ enter: 500, exit: 500 }}>
        <div style={{ padding: "0px 0px 20px 0px" }}>
          <div>
            <Typography
              variant="h4"
              style={{
                textAlign: "center",
                padding: 20,
              }}
            >
              Pitch Recognition
            </Typography>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {isSurvival ? (
              <Typography variant="body1" style={{ fontSize: 20 }}>
                Number of notes: {noteCount}
              </Typography>
            ) : (
              <Typography variant="body1" style={{ fontSize: 20 }}>
                Number of notes:
                <IconButton
                  size="small"
                  onClick={() => setNoteCount(Math.max(1, noteCount - 1))}
                >
                  <RemoveIconIncrementButton />
                </IconButton>
                {noteCount}
                <IconButton
                  size="small"
                  onClick={() => setNoteCount(Math.min(12, noteCount + 1))}
                >
                  <AddIconIncrementButton />
                </IconButton>
              </Typography>
            )}
          </div>
          <div style={{ paddingTop: 20 }}>
            <DivKeys>
              <ButtonGroup>
                {pitches.map((p, i) => {
                  const disabled =
                    (settings.customNotes && !customNotes[i]) || !hasStarted;
                  return (
                    <Button
                      key={i}
                      disabled={disabled}
                      style={{
                        width: 80,
                        backgroundColor: disabled
                          ? undefined
                          : pitchSelect[i]
                          ? "purple"
                          : blackKeys.includes(i)
                          ? "black"
                          : "white",
                        color: disabled
                          ? undefined
                          : pitchSelect[i] || blackKeys.includes(i)
                          ? "white"
                          : "black",
                      }}
                      variant={pitchSelect[i] ? "contained" : "text"}
                      onClick={() => togglePitch(i)}
                    >
                      {p}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </DivKeys>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ButtonActionButton
                variant="outlined"
                onClick={play}
                disabled={instrument === null || !hasStarted}
              >
                {instrument === null ? "Loading..." : "Play sound"}
              </ButtonActionButton>

              {!hasStarted ? (
                <StartButton
                  variant="contained"
                  onClick={() => {
                    setStarted(true);
                    newChord();
                  }}
                >
                  Start!
                </StartButton>
              ) : isSurvival && lives() === 0 ? (
                <ButtonActionButton variant="contained" onClick={restart}>
                  Restart
                </ButtonActionButton>
              ) : isShowAnswer ? (
                <ButtonActionButton
                  variant="contained"
                  color="primary"
                  onClick={nextAfterShowAnswer}
                >
                  Continue
                </ButtonActionButton>
              ) : (
                <ButtonActionButton
                  variant="contained"
                  color="primary"
                  onClick={check}
                  disabled={
                    (isSurvival && lives() === 0) ||
                    pitchSelect.every((p) => p === false)
                  }
                >
                  Confirm
                </ButtonActionButton>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {!isSurvival && (
                <ButtonActionButton
                  variant="text"
                  onClick={showAnswer}
                  disabled={isShowAnswer}
                >
                  Show Answer
                </ButtonActionButton>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0px",
                  height: 24,
                }}
              >
                {lastChord.length > 0 ? (
                  <Typography
                    variant="body1"
                    style={{
                      color: !incorrect
                        ? "green"
                        : isShowAnswer
                        ? "grey"
                        : "red",
                      fontWeight: "bold",
                    }}
                  >
                    The {lastChord.length > 1 ? "full chord" : "note"} was{" "}
                    {lastChord.join("-")}
                  </Typography>
                ) : (
                  incorrect && (
                    <EncouragementText
                      variant="body1"
                      style={{
                        color: "red",
                        fontWeight: "bold",
                      }}
                      encouragementAnimation={encouragementAnimation}
                    >
                      {encouragements[encouragementText]}
                    </EncouragementText>
                  )
                )}
              </div>
              <Typography variant="body1" style={{ color: "green" }}>
                Correct: {correctCount}
              </Typography>
              {isSurvival ? (
                <Typography
                  variant="body1"
                  style={{
                    color: lives() < 2 ? "red" : "grey",
                    position: "relative",
                    paddingRight: 15,
                  }}
                >
                  Lives left:{" "}
                  <LifeText
                    style={{ position: "absolute", paddingLeft: 5 }}
                    livesAnimation={livesAnimation}
                  >
                    {lives()}
                  </LifeText>
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  style={{
                    color: "red",
                  }}
                >
                  Incorrect: {incorrectCount}
                </Typography>
              )}
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                width: "90%",
                marginTop: 20,
                border: "1px solid " + theme.palette.primary.main + "40",
                borderRadius: 4,
                padding: 40,
              }}
            >
              <div>
                <FormControl>
                  <FormGroup>
                    <div style={{ display: "flex", marginBottom: 20 }}>
                      <InputLabel>Reference Pitch</InputLabel>
                      <Select
                        style={{ width: 120 }}
                        value={refPitch}
                        label="Reference Pitch"
                        onChange={(e) => {
                          setRefPitch(e.target.value);
                        }}
                      >
                        {pitches.map((i, k) => (
                          <MenuItem value={k} key={k}>
                            {i}
                          </MenuItem>
                        ))}
                      </Select>
                      <Button
                        onClick={() => {
                          instrument?.stop();
                          instrument?.play(synthPitches[refPitch] + "4");
                        }}
                        style={{ marginLeft: 20 }}
                      >
                        Play Reference Pitch
                      </Button>
                    </div>
                  </FormGroup>
                </FormControl>

                <div
                  style={{
                    display: "flex",
                    marginBottom: 20,
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1" style={{ paddingRight: 20 }}>
                    Range:{" "}
                  </Typography>

                  <FormControl>
                    <FormGroup>
                      <InputLabel>Low</InputLabel>
                      <Select
                        style={{ width: 80 }}
                        value={range.low}
                        label="Low"
                        onChange={(e) => {
                          setRange((r) => ({ ...r, low: e.target.value }));
                        }}
                      >
                        {getRange(0, 8).map((_, k) => (
                          <MenuItem value={k} key={k}>
                            {"C" + k}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormGroup>
                  </FormControl>
                  <Typography variant="body1" style={{ padding: "0px 20px" }}>
                    to
                  </Typography>
                  <FormControl>
                    <FormGroup>
                      <InputLabel>High</InputLabel>
                      <Select
                        style={{ width: 80 }}
                        value={range.high}
                        label="High"
                        onChange={(e) => {
                          setRange((r) => ({ ...r, high: e.target.value }));
                        }}
                      >
                        {getRange(1, 9).map((_, k) => (
                          <MenuItem value={k} key={k}>
                            {"C" + k}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormGroup>
                  </FormControl>
                </div>
                <FormControl>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allowSameNote}
                          onChange={handleChangeSettings}
                          name="allowSameNote"
                        />
                      }
                      label="Allow the same note in different octaves (e.g. C2 and C4)"
                    />
                  </FormGroup>

                  <FormGroup>
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
                    {pitches.map((v, k) => (
                      <Button
                        onClick={() => {
                          setCustomNotes((n) =>
                            n.map((o, i) => (i === k ? !o : o))
                          );
                        }}
                        style={{ width: 64 }}
                        key={k}
                        variant={customNotes[k] ? "contained" : "outlined"}
                        disabled={!settings.customNotes}
                      >
                        {v}
                      </Button>
                    ))}
                  </ButtonGroup>
                </FormControl>
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </>
  );
};

export default Pitch;
