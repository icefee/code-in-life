import React from 'react';
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'

class Index extends React.Component {
  public render() {
    return (
      <Box sx={{
        p: 1
      }}>
        <Paper>
          <Alert severity="success">常用的组件集成</Alert>
        </Paper>
      </Box>
    )
  }
}

export default Index;
