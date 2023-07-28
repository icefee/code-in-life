import React, { useState } from 'react'
import Menu, { type MenuProps } from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

type MenuType = {
    icon: React.ReactNode;
    text: React.ReactNode;
    onClick?: VoidFunction;
} | null

type MenuOptions = Omit<MenuProps, 'anchorEl' | 'open' | 'onClose'>;

function useMenu<AnchorElement extends Element = HTMLButtonElement>(props?: MenuOptions) {

    const [anchorEl, setAnchorEl] = useState<AnchorElement>(null)
    const [menuItems, setMenuItems] = useState<MenuType[]>([])
    const [extraOptions, setExtraOptions] = useState<MenuOptions>()

    const outlet = (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={
                () => {
                    setAnchorEl(null)
                }
            }
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            {...props}
            {...extraOptions}
        >
            {
                menuItems.map(
                    (menu: MenuType, index) => {
                        if (menu) {
                            const { icon, text, onClick } = menu
                            return (
                                <MenuItem key={index} onClick={onClick}>
                                    <ListItemIcon>
                                        {icon}
                                    </ListItemIcon>
                                    <Typography variant="inherit" noWrap>{text}</Typography>
                                </MenuItem>
                            )
                        }
                        return (
                            <Divider />
                        )
                    }
                )
            }
        </Menu>
    )

    const showMenu = (anchor: AnchorElement, menus: MenuType[], options?: MenuOptions) => {
        setMenuItems(menus);
        setExtraOptions(options);
        setAnchorEl(anchor);
    }

    const hideMenu = () => {
        setAnchorEl(null)
    }

    return {
        outlet,
        showMenu,
        hideMenu
    }
}

export default useMenu;
