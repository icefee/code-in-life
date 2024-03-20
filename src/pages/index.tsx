import React, { ComponentType } from 'react'
import { navigate, type PageProps, type GetServerDataProps, type GetServerDataReturn } from 'gatsby'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import Stack from '@mui/material/Stack'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import AlbumIcon from '@mui/icons-material/Album'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import TheatersIcon from '@mui/icons-material/Theaters'
import QrCodeIcon from '@mui/icons-material/QrCode'
import SaveAltIcon from '@mui/icons-material/SaveAlt'

export function Head() {
    return (
        <>
            <title key="apps">应用中心</title>
        </>
    )
}

interface App {
    id: string;
    name: string;
    url: string;
    icon: ComponentType<SvgIconProps>;
    iconForeground: string;
    iconBackground: string;
}

const apps: App[] = [
    {
        id: 'music',
        name: '音乐搜索',
        url: '/music',
        icon: AlbumIcon,
        iconForeground: '#222222bd',
        iconBackground: 'linear-gradient(15deg, #2196f3, #ff5722)'
    },
    {
        id: 'video',
        name: '影视搜索',
        url: '/video',
        icon: TheatersIcon,
        iconForeground: '#ffffffcf',
        iconBackground: 'linear-gradient(0, #9c27b0, #cddc39)'
    },
    {
        id: 'hls-download',
        name: 'hls视频下载',
        url: '/hls-download',
        icon: SaveAltIcon,
        iconForeground: '#fff',
        iconBackground: 'linear-gradient(60deg, #ff9800, #4ac375)'
    },
    {
        id: 'qr',
        name: '二维码生成',
        url: '/qr',
        icon: QrCodeIcon,
        iconForeground: '#ffffffcf',
        iconBackground: 'linear-gradient(300deg, #ff5722, #00bcd4)'
    }
]

enum AppMode {
    website = 'website',
    pwa = 'pwa'
}

interface AppIconProps {
    app: App;
    mode: AppMode;
    // onBoot?(app: App): void;
}

function AppIcon({ app, mode }: AppIconProps) {
    const Icon = app.icon;
    const iconColor = app.iconBackground.match(/#[\da-f]{6}/g)?.[0]

    const iconNode = (
        <Stack
            sx={{
                alignItems: 'center',
                transition: (theme) => theme.transitions.create('filter'),
                '&:hover': {
                    filter: `drop-shadow(0 0 24px ${iconColor})`
                }
            }}
            rowGap={.5}
        >
            <Stack
                sx={{
                    width: 'calc(var(--icon-size) * .8)',
                    aspectRatio: '1 / 1',
                    background: app.iconBackground,
                    borderRadius: 2,
                    fontSize: 'calc(var(--icon-size) * .6)',
                    color: app.iconForeground
                }}
                justifyContent="center"
                alignItems="center"
            >
                <Icon fontSize="inherit" />
            </Stack>
            <Typography
                variant="button"
                sx={{
                    fontSize: 'calc(var(--icon-size) * .16)'
                }}
            >{app.name}</Typography>
        </Stack>
    )

    return (
        <Stack sx={{
            width: 'var(--icon-size)',
        }}>
            {
                mode === AppMode.pwa ? (
                    <ButtonBase
                        href={app.url}
                        target="_blank"
                        disableRipple
                    >
                        {iconNode}
                    </ButtonBase>
                ) : (
                    <ButtonBase
                        onClick={
                            () => navigate(app.url)
                        }
                        disableRipple
                    >
                        {iconNode}
                    </ButtonBase>
                )
            }
        </Stack>
    )
}

interface ServerProps {
    mode: AppMode;
}

export async function getServerData({ query }: GetServerDataProps): Promise<GetServerDataReturn<ServerProps>> {
    const { mode } = query as Record<'mode', string>;
    return {
        props: {
            mode: mode === AppMode.pwa ? AppMode.pwa : AppMode.website
        }
    }
}

function Index({ serverData }: PageProps<object, object, unknown, ServerProps>) {
    const mode = serverData.mode;
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
            <Stack
                sx={(theme) => ({
                    '--icon-size': `min(calc((100vw - ${theme.spacing(10)}) / 4), 90px)`,
                    gap: 2,
                    [theme.breakpoints.up('sm')]: {
                        '--icon-size': '96px',
                        gap: 3
                    }
                })}
                direction="row"
                flexWrap="wrap"
            >
                {
                    apps.map(
                        (app) => (
                            <AppIcon
                                key={app.id}
                                mode={mode}
                                app={app}
                            />
                        )
                    )
                }
            </Stack>
        </Stack>
    )
}

export default Index;