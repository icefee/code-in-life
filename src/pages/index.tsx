import React from 'react';
import Stack from '@mui/material/Stack';
// import Paper from '@mui/material/Paper';
import { SvgIconProps } from '@mui/material/SvgIcon';
import AlbumIcon from '@mui/icons-material/Album';
import TheatersIcon from '@mui/icons-material/Theaters';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
// import Alert from '@mui/material/Alert';
// import { PlayerContainer, Player } from '../components/react-player';
// import Hls from 'hls.js';

export function Head() {
  return (
    <title>应用中心</title>
  )
}

/*
class Index extends React.Component {
  public render() {
    return (
      <Box sx={{
        p: 1
      }}>
        <Paper>
          <Alert severity="success">常用的组件集成</Alert>
        </Paper>
        <Box sx={{
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
        </Box>
      </Box>
    )
  }
}
*/

interface App {
  id: string;
  name: string;
  url: string;
  icon: React.ComponentType<SvgIconProps>;
  iconForeground: string;
  iconBackground: string;
}

const apps: App[] = [
  {
    id: 'music',
    name: '音乐搜索',
    url: '/music/',
    icon: AlbumIcon,
    iconForeground: '#222222bd',
    iconBackground: 'linear-gradient(0, #ff5200, #00bcd4)'
  },
  {
    id: 'video',
    name: '影视搜索',
    url: '/video/',
    icon: TheatersIcon,
    iconForeground: '#ffffffcf',
    iconBackground: 'linear-gradient(0, #9c27b0, #cddc39)'
  }
];

interface AppIconProps {
  app: App;
}

function AppIcon({ app }: AppIconProps) {
  const Icon = app.icon;
  return (
    <Stack sx={{
      width: 'var(--icon-size)',
    }}>
      <ButtonBase href={app.url} target="_blank" disableRipple>
        <Stack style={{
          color: '#fff',
          alignItems: 'center'
        }} rowGap={.5}>
          <Stack sx={{
            width: 'calc(var(--icon-size) * .8)',
            aspectRatio: '1 / 1',
            background: app.iconBackground,
            borderRadius: 2,
            fontSize: 'calc(var(--icon-size) * .6)',
            color: app.iconForeground
          }} justifyContent="center" alignItems="center">
            <Icon fontSize="inherit" />
          </Stack>
          <Typography variant="button">{app.name}</Typography>
        </Stack>
      </ButtonBase>
    </Stack>
  )
}

function Index() {
  return (
    <Stack sx={{
      height: '100%',
      background: 'var(--linear-gradient-image)',
      p: 3,
      overflowY: 'auto',
      '--icon-size': '96px'
    }} direction="row" gap={3} flexWrap="wrap">
      {
        apps.map(
          (app) => (
            <AppIcon key={app.id} app={app} />
          )
        )
      }
    </Stack>
  )
}

export default Index;
