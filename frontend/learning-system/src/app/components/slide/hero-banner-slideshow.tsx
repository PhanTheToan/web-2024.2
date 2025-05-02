'use client'

import { useState, useEffect } from "react"
import { Box, Typography, Button, CircularProgress } from "@mui/material"
import Link from "next/link"

export default function HeroBanner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [backgroundImages, setBackgroundImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState(null)

  // Fetch the image from the API
  useEffect(() => {
    const fetchImageURL = async () => {
      try {
        const response = await fetch('https://api.alphaeducation.io.vn/api/upload/get-image/LANDING_PAGE')
        const data = await response.json()

        if (data && data.body && data.body[0] && data.body[0].imageUrl) {
          // Set the fetched URL into the backgroundImages array
          setBackgroundImages([data.body[0].imageUrl])
        } else {
          throw new Error("Image URL not found in the response.")
        }
      } catch  {
        
        console.error("Error fetching image:")
      } finally {
        setLoading(false)
      }
    }

    fetchImageURL()
  }, [])

  // Set up the slideshow interval, though now it only has one image
  useEffect(() => {
    if (backgroundImages.length === 0) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1))
    }, 5000) // Change image every 5 seconds, though only one image in this case

    return () => clearInterval(interval)
  }, [backgroundImages]) // Dependency on backgroundImages

  if (loading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" color="error">
          Error: {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        px: { xs: 6, md: 40 },
        py: { xs: 10, md: 20 },
        mb: "90px",
        overflow: "hidden",
      }}
    >
      {/* Background image with fade transition */}
      {backgroundImages.map((image, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: currentImageIndex === index ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: -1,
          }}
        />
      ))}

      {/* Content - remains the same */}
      <Box sx={{ maxWidth: { xs: "90%", md: "50%" }, textAlign: "left", zIndex: 1 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
          Build Skills With <br /> Online Course
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Get started with modern education and skills that help you get ahead and stay ahead. Thousands of courses to
          help you grow.
        </Typography>
        <Link href="/courses">
          <Button variant="contained" color="warning" sx={{ borderRadius: "50px", px: 4, mt: 3 }}>
            Get Started
          </Button>
        </Link>
      </Box>
    </Box>
  )
}
