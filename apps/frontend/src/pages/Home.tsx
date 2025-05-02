// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'
import { ThemeToggle } from '../components/common/ThemeToggle'

function HomePage() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Job Platform
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Job Platform!
        </Typography>
        <Typography>
          Your main application content will go here.
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
          This box uses theme colors.
        </Box>
      </Container>
    </>
  )
}

export default HomePage
