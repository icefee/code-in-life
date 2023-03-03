import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
// import { PlayerContainer, Player } from '../components/react-player';
// import Hls from 'hls.js';

class Index extends React.Component {
  public render() {
    return (
      <Box sx={{
        p: 1
      }}>
        <Paper>
          <Alert severity="success">常用的组件集成</Alert>
        </Paper>
        {/* <Box sx={{
          height: 400
        }}>
          <PlayerContainer>
            <Player
              url="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
              autoplay
              customType={{
                hls: (video, url) => {
                  const hls = new Hls();
                  hls.loadSource(url);
                  hls.attachMedia(video);
                  return hls;
                }
              }}
            />
          </PlayerContainer>
        </Box> */}
      </Box>
    )
  }
}

export default Index;
