import { Paper, Typography } from "@mui/material";

function Home() {
  return (
    <>
     <Typography variant="h2" sx={{ my: 2, fontWeight: 700, color: '#111111' }}>
          Home
        </Typography>
       <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 1,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1.125rem", md: "1.25rem" },
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          BCD Home Page
        </Typography>
      </Paper>
    </>
  )
}

export default Home;
