import React, { useState, useRef } from 'react'
import { Link, PageProps } from 'gatsby'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import ButtonBase from '@mui/material/ButtonBase'
import Backdrop from '@mui/material/Backdrop'
import Typography from '@mui/material/Typography'
import AlbumIcon from '@mui/icons-material/Album'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import TheatersIcon from '@mui/icons-material/Theaters'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import QrCodeIcon from '@mui/icons-material/QrCode'
import PopDialog, { PopDialogRef } from '../components/PopDialog'
import { Spinner } from '../components/loading'

export function Head() {
    return (
        <>
            <title key="index">应用中心</title>
        </>
    )
}

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
        iconBackground: 'linear-gradient(15deg, #2196F3, #FF5722)'
    },
    {
        id: 'video',
        name: '影视搜索',
        url: '/video/',
        icon: TheatersIcon,
        iconForeground: '#ffffffcf',
        iconBackground: 'linear-gradient(0, #9c27b0, #cddc39)'
    },
    {
        id: 'music2',
        name: '音乐搜索2',
        url: '/mmj/',
        icon: MusicNoteIcon,
        iconForeground: '#fff',
        iconBackground: 'linear-gradient(45deg, #FF5722, #E91E63)'
    },
    {
        id: 'qr',
        name: '二维码生成',
        url: '/qr',
        icon: QrCodeIcon,
        iconForeground: '#ffffffcf',
        iconBackground: 'linear-gradient(300deg, #ff5722, #00bcd4)'
    }
];

interface GatsbyLinkProps {
    href: string;
}

function GatsbyLink({ href, ...rest }: GatsbyLinkProps) {
    return (
        <Link to={href} {...rest} />
    )
}

interface AppIconProps {
    app: App;
    onBoot?(app: App): void;
}

function AppIcon({ app, onBoot }: AppIconProps) {
    const Icon = app.icon;
    return (
        <Stack sx={{
            width: 'var(--icon-size)',
        }}>
            <ButtonBase onClick={
                () => onBoot?.(app)
            } disableRipple>
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

function Index({ location }: PageProps<object, object, unknown, unknown>) {

    const searchParams = new URLSearchParams(location.search)
    const dialogRef = useRef<PopDialogRef | null>(null)
    const [runningApp, setRunningApp] = useState<App | null>(null)
    const [loading, setLoading] = useState(false)

    const isPwaMode = searchParams.get('mode') === 'pwa'

    return (
        <Stack sx={(theme) => ({
            height: '100%',
            background: 'var(--linear-gradient-image)',
            p: 2,
            overflowY: 'auto',
            [theme.breakpoints.up('sm')]: {
                p: 3
            }
        })}>
            <Stack sx={(theme) => ({
                '--icon-size': `clamp(75px, calc((100vw - ${theme.spacing(10)}) / 4), 90px)`,
                gap: 2,
                [theme.breakpoints.up('sm')]: {
                    '--icon-size': '96px',
                    gap: 3
                }
            })} direction="row" flexWrap="wrap">
                {
                    apps.map(
                        (app) => (
                            <AppIcon
                                key={app.id}
                                app={app}
                                onBoot={
                                    (app) => {
                                        if (isPwaMode) {
                                            setRunningApp(app)
                                            dialogRef.current.open()
                                            setLoading(true)
                                        }
                                        else {
                                            open(app.url)
                                        }
                                    }
                                }
                            />
                        )
                    )
                }
            </Stack>
            <PopDialog
                ref={dialogRef}
            >
                <AppBar position="relative">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => dialogRef.current.close()}
                            aria-label="close"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography
                            sx={{
                                ml: 2,
                                flex: 1
                            }}
                            variant="h6"
                            component="div"
                        >{runningApp?.name}</Typography>
                    </Toolbar>
                </AppBar>
                <Stack sx={{
                    position: 'relative',
                    flexGrow: 1,
                    overflow: 'hidden'
                }}>
                    <iframe
                        style={{
                            display: 'block',
                            border: 'none',
                            height: '100%'
                        }}
                        src={runningApp?.url}
                        onLoad={
                            () => setLoading(false)
                        }
                    />
                    <Backdrop
                        sx={{
                            position: 'absolute',
                            color: '#fff'
                        }}
                        open={loading}>
                        <Spinner
                            sx={{
                                fontSize: 40
                            }}
                        />
                    </Backdrop>
                </Stack>
            </PopDialog>
        </Stack>
    )
}

export default Index;