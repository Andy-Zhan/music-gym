import { Button, Paper, Tooltip, Typography, Fade } from "@mui/material";
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import logo from "./img/musicplane.png";
import { OpenInNew } from "@mui/icons-material";

const BoxPaper = styled(Paper)((props) => ({
  padding: 20,
  margin: 20,
  height: 200,
  width: 400,
  borderRadius: 20,
  display: "flex",
  flexDirection: "column",
  position: "relative",
}));

const StartButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  margin: 10,
}));

const Home = ({ setPage }) => {
  const [hoverLogo, setHoverLogo] = useState(false);
  return (
    <div style={{ padding: "70px 20px 50px 20px" }}>
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Tooltip title="Visit my channel!" placement="top">
            <a
              style={{
                width: 64,
                height: 64,
                alignSelf: "center",
                border: "none",
              }}
              onMouseEnter={() => setHoverLogo(true)}
              onMouseLeave={() => setHoverLogo(false)}
              href="https://www.youtube.com/channel/UCeYjyvmYEdEWlUkB-YYeNUw"
            >
              <div
                style={{
                  position: "absolute",
                  zIndex: 2,
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "black",
                  opacity: hoverLogo ? 0.6 : 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "middle",
                  color: "white",
                }}
              >
                <OpenInNew
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>
              <img
                src={logo}
                style={{
                  width: 64,
                  height: 64,
                  position: "absolute",
                }}
                alt="logo"
              />
            </a>
          </Tooltip>
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
              padding: 20,
              fontWeight: "bold",
            }}
          >
            The Music Gym
          </Typography>
        </div>
      </div>
      <Fade in={true} timeout={{ enter: 500, exit: 500 }}>
        <div style={{ display: "flex" }}>
          <BoxPaper>
            <Typography
              variant="h5"
              style={{
                textAlign: "center",
                padding: 20,
              }}
            >
              Pitch Recognition
            </Typography>
            <Typography
              variant="body1"
              style={{ textAlign: "center", flexGrow: 1 }}
            >
              Enhance your pitch memory or <br /> pitch recognition abilities 🎵
            </Typography>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <StartButton
                  variant="contained"
                  onClick={() => setPage("pitch")}
                >
                  Select
                </StartButton>
              </div>
            </div>
          </BoxPaper>
          <BoxPaper>
            <Typography
              variant="h5"
              style={{
                textAlign: "center",
                padding: 20,
              }}
            >
              Random Melody Generator
            </Typography>
            <Typography
              variant="body1"
              style={{ textAlign: "center", flexGrow: 1 }}
            >
              Generate a random melody to challenge your compositional or
              improvisational skills 🎼
            </Typography>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <StartButton
                variant="contained"
                onClick={() => setPage("randomMelody")}
              >
                Select
              </StartButton>
            </div>
          </BoxPaper>
        </div>
      </Fade>
    </div>
  );
};

export default Home;
